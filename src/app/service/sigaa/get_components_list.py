import urllib.parse
from typing import List

import json
import re
import ast

from requests import Session
from bs4 import BeautifulSoup


class Materia:
    cod: str
    nome: str
    ch: int
    requirements_post_data: dict
    post_requirements: List
    post_requirements_query: str

    def __init__(self, cod, nome, ch, component_id, requirements_post_data):
        self.cod = cod
        self.nome = nome
        self.ch = int(ch.replace('h', ''))
        self.post_requirements = []
        self.component_id = component_id

        requirements_post_data = ast.literal_eval(requirements_post_data)
        requirements_post_data['formListagemComponentes'] = 'formListagemComponentes'
        requirements_post_data['javax.faces.ViewState'] = 'j_id2'
        requirements_post_data['id'] = int(component_id)
        self.post_requirements_query = urllib.parse.urlencode(requirements_post_data)

    def set_post_requirements(self, requirements):
        self.post_requirements = requirements


cod_unidades = 0  # FGA = 673, 0 para buscar todas, MAT 518

sigaa_url: str = 'https://sigaa.unb.br/sigaa/public/componentes/busca_componentes.jsf'
#
header = {'Content-Type': 'application/x-www-form-urlencoded',
          'Referer': sigaa_url,
          'Origin': 'https://sigaa.unb.br',
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.0.0'}
data: dict = {
    'form': 'form',
    'form:nivel': 'G',
    'form:checkTipo': 'on',
    'form:tipo': 2,
    'form:j_id_jsp_190531263_11': None,
    'form:j_id_jsp_190531263_13': None,
    # 'form:checkUnidade': 'on',
    'form:unidades': cod_unidades,
    'form:btnBuscarComponentes': 'Buscar Componentes',
    'javax.faces.ViewState': 'j_id1'
}


def write(x, i):
    write_data = []
    for c in x:
        print(
            f"Getting post-requirements for component: {c.cod} {c.nome}")

        r = s.get(f'{sigaa_url}?{c.post_requirements_query}',
                  headers=header,
                  allow_redirects=False
                  )
        # print(f'\t > Request to {sigaa_url} returned status code: {r.status_code}')

        requirements_soup = BeautifulSoup(r.content, 'html.parser', from_encoding='UTF-8')
        regex_match = re.compile('pré-requisito(.*?)Histórico').findall(requirements_soup.text.replace('\n', ' '))

        if regex_match:
            requirements = regex_match[0].replace(
                'pré-requisito', '').replace('Histórico', '')
            print(f"\t\t > {c.cod} - {c.nome} blocks: {requirements.strip().split('   ')}")
            c.set_post_requirements(requirements.strip().split('   '))

        c_dict = c.__dict__
        c_dict.pop('post_requirements_query')
        write_data.append(c.__dict__)

    with open(f'materias-{i}.json', 'w', encoding='utf-8') as f:
        f.write(json.dumps(write_data, indent=2))


s = Session()
s.get(sigaa_url)
r = s.post(sigaa_url, data=data, headers=header)
print(f'Request to {r.url} returned status code: {r.status_code}.')
print('Parsing content...')

soup = BeautifulSoup(r.content, 'html.parser', from_encoding='UTF-8')
components: List[Materia] = []

table_listagem = soup.select('table.listagem')[0]
try:
    # 2003 matérias
    for index, linha in enumerate(table_listagem.select('tr')):
        component_id = ''
        post_data = ''

        for a in linha.select('a'):
            if a['title']:
                if 'Detalhes' in a['title']:
                    component_info = a['onclick']
                    #
                    post_data_pattern = re.compile("\{\'.*\'\}")
                    post_data = post_data_pattern.findall(component_info)[0]
                    pattern = re.compile("'id':'[\\d]*'")
                    component_id = int(pattern.findall(component_info)[0].replace("'", '').split(':')[-1])
        dados = []
        for td in linha.select('td'):
            dados.append(td.text.replace('\n', ''))
        if dados:
            components.append(
                Materia(
                    cod=dados[0],
                    nome=dados[1],
                    ch=dados[3],
                    component_id=component_id,
                    requirements_post_data=post_data
                )
            )

        if len(components) == 100:
            write(components, int(index / 100))
            components = []


except Exception as e:
    print(e)
    pass
    write(components, -1)
    components = []
