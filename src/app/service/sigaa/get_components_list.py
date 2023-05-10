import urllib.parse
from typing import List

import json
import re
import ast

import requests
from requests import Session
from bs4 import BeautifulSoup


class Materia:
    cod: str
    nome: str
    ch: int
    post_requirements: List
    pre_requirements: List
    requirements_query: str

    def __init__(self, cod, nome, ch, component_id, requirements_post_data):
        self.cod = cod
        self.nome = nome
        self.ch = int(ch.replace('h', ''))
        self.post_requirements = []

        requirements_post_data = ast.literal_eval(requirements_post_data)
        requirements_post_data['formListagemComponentes'] = 'formListagemComponentes'
        requirements_post_data['javax.faces.ViewState'] = 'j_id2'
        requirements_post_data['id'] = int(component_id)

        self.requirements_query = urllib.parse.urlencode(requirements_post_data)

    def set_post_requirements(self, requirements):
        self.post_requirements = [a.split('-')[0].strip() for a in requirements.strip().split('   ')]

    def set_pre_requirements(self, requirements):
        if requirements[0] == '-':
            self.pre_requirements = []
            return
        self.pre_requirements = [a.replace('(', '').replace(')', '').strip() for a in
                                 requirements[0].replace(' E ', ' & ').replace(' OU ', ' || ').split('||')]


def write():
    global departments
    write_data = []
    for dep in departments.keys():
        for c in departments[dep]:
            c_dict = c.__dict__
            if 'requirements_query' in c_dict.keys():
                c_dict.pop('requirements_query')
            write_data.append(c.__dict__)

        with open(f'data/materias-{dep}.json', 'a', encoding='utf-8') as f:
            f.write(json.dumps(write_data, indent=2))
    departments = dict()


def main(cod_unidades):
    s = Session()

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
        return
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
                        pattern = re.compile("'id':'[\d]*'")
                        component_id = int(pattern.findall(component_info)[0].replace("'", '').split(':')[-1])
            dados = []
            for td in linha.select('td'):
                dados.append(td.text.replace('\n', ''))
            if dados:
                c = Materia(
                    cod=dados[0],
                    nome=dados[1],
                    ch=dados[3],
                    component_id=component_id,
                    requirements_post_data=post_data
                )
                r = s.get(f'{sigaa_url}?{c.requirements_query}',
                          headers=header,
                          allow_redirects=False)
                requirements_soup = BeautifulSoup(r.content, 'html.parser', from_encoding='UTF-8')
                regex_match = re.compile('pré-requisito(.*?)[Histórico|Outro]').findall(
                    requirements_soup.text.replace('\n', ' '))
                if regex_match:
                    requirements = regex_match[0]
                    c.set_post_requirements(requirements)
                pre_requirements = re.compile('Pré-Requisitos:(.*?)Co-Re').findall(
                    requirements_soup.text.replace('\n', ' '))
                if pre_requirements:
                    requirements = pre_requirements[0].replace('\t', '')
                    c.set_pre_requirements(requirements.strip().split('   '))

                dep_name = re.sub('\d', '', c.cod)
                if dep_name in departments.keys():
                    departments[dep_name].append(c)
                else:
                    departments[dep_name] = [c]
        write()

    except Exception as e:
        print(e)
        write()


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
departments: dict = dict()

if __name__ == '__main__':
    print(f'Searching for departments at UnB...')
    codes = get_department_codes()
    print(f'Found {len(codes)} departments.')

    for cod in codes.keys():
        print(f'Searching components for departament: {codes[cod]}...')
        main(cod)
