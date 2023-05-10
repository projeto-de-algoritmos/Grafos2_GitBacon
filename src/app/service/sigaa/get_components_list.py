import urllib.parse
from pathlib import Path
from typing import List

import json
import re
import ast
import requests

from requests import Session
from bs4 import BeautifulSoup


class Materia:
    codigo: str
    nome: str
    carga_horaria: int
    eh_requisito_de: List
    pre_requisitos: List

    def __init__(self, cod, nome, ch):
        self.codigo = cod
        self.nome = nome
        self.carga_horaria = int(ch.replace('h', ''))
        self.eh_requisito_de = []

    def set_post_requirements(self, requirements):
        self.eh_requisito_de = [a.split('-')[0].strip() for a in requirements.strip().split('   ')]

    def set_pre_requirements(self, requirements):
        if requirements[0] == '-':
            self.pre_requisitos = []
            return
        self.pre_requisitos = [a.replace('(', '').replace(')', '').strip() for a in
                               requirements[0].replace(' E ', ' & ').replace(' OU ', ' || ').split('||')]


def encode_requirements_query(requirements_post_data, component_id):
    requirements_post_data = ast.literal_eval(requirements_post_data)
    requirements_post_data['formListagemComponentes'] = 'formListagemComponentes'
    requirements_post_data['javax.faces.ViewState'] = 'j_id2'
    requirements_post_data['id'] = int(component_id)

    return urllib.parse.urlencode(requirements_post_data)


def write(departments: dict[str, List[Materia]]):
    for dep in departments.keys():
        write_data = [c.__dict__ for c in departments[dep]]
        dest = f'data/materias-{dep}.json'
        if Path(dest).is_file():
            old_data = list(json.loads(Path(dest).open('r').read()))

            write_data += old_data
        with open(dest, 'w', encoding='UTF-8') as f:
            txt = json.dumps(write_data, indent=3, ensure_ascii=False).encode('utf-8')
            f.write(txt.decode())


def get_components_from_department(cod_unidades) -> dict[str, List[Materia]]:
    s = Session()
    departments: dict[str, List[Materia]] = dict()
    data: dict = {
        'form': 'form',
        'form:nivel': 'G',
        'form:checkTipo': 'on',
        'form:tipo': 2,
        'form:j_id_jsp_190531263_11': None,
        'form:j_id_jsp_190531263_13': None,
        'form:checkUnidade': 'on',
        'form:unidades': cod_unidades,
        'form:btnBuscarComponentes': 'Buscar Componentes',
        'javax.faces.ViewState': 'j_id1'
    }

    s.get(sigaa_url)
    r = s.post(sigaa_url, data=data, headers=header)

    soup = BeautifulSoup(r.content, 'html.parser', from_encoding='UTF-8')

    table_listagem = soup.select('table.listagem')
    if not table_listagem:
        return dict()
    table_listagem = table_listagem[0]

    try:
        table_rows = table_listagem.select('tr')
        for index, linha in enumerate(table_rows):
            component_id = ''
            post_data = ''

            for a in linha.select('a'):
                if a['title']:
                    if 'Detalhes' in a['title']:
                        component_info = a['onclick']
                        #
                        post_data_pattern = re.compile("\{\'.*\'}")
                        post_data = post_data_pattern.findall(component_info)[0]
                        pattern = re.compile("'id':'\d*'")
                        component_id = int(pattern.findall(component_info)[0].replace("'", '').split(':')[-1])
            dados = []
            for td in linha.select('td'):
                dados.append(td.text.replace('\n', ''))
            if dados:
                c = Materia(
                    cod=dados[0],
                    nome=dados[1],
                    ch=dados[3],
                )
                r = s.get(
                    f'{sigaa_url}?{encode_requirements_query(post_data, component_id)}',
                    headers=header,
                    allow_redirects=False)

                requirements_soup = BeautifulSoup(r.content, 'html.parser', from_encoding='UTF-8')
                txt = requirements_soup.text.replace('\n', ' ')
                regex_match = re.compile(
                    'como pré-requisito(.*?)(Histórico|Outro|<< Voltar|Currículo|Equivalência)').findall(txt)
                if regex_match:
                    requirements = regex_match[0][0]
                    c.set_post_requirements(requirements)
                pre_requirements = re.compile('Pré-Requisitos:(.*?)Co-Re').findall(
                    requirements_soup.text.replace('\n', ' '))
                if pre_requirements:
                    requirements = pre_requirements[0].replace('\t', '')
                    c.set_pre_requirements(requirements.strip().split('   '))

                dep_name = re.sub('\d', '', c.codigo)
                if dep_name in departments.keys():
                    departments[dep_name].append(c)
                else:
                    departments[dep_name] = [c]

    except Exception as e:
        print(e)
    return departments


def get_department_codes() -> dict:
    codes = dict()
    r = requests.get(sigaa_url)

    soup = BeautifulSoup(r.content, 'html.parser', from_encoding='UTF-8')
    for op in soup.find(id='form:unidades').find_all('option'):
        code = int(op['value'])
        if code != 0 \
                and 'pós-graduação' not in op.text.lower() \
                and 'reitoria' not in op.text.lower():
            codes[int(op['value'])] = op.text.split('-')[0].strip()

    return codes


# Globals
sigaa_url: str = 'https://sigaa.unb.br/sigaa/public/componentes/busca_componentes.jsf'
header = {'Content-Type': 'application/x-www-form-urlencoded'}

if __name__ == '__main__':
    print(f'Searching for departments at UnB...')
    codes = get_department_codes()
    print(f'Found {len(codes)} departments.')

    for codigo in codes.keys():
        print(f'Searching components for departament: {codes[codigo]}...')
        write(get_components_from_department(codigo))
