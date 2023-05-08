import requests

from requests import Session
from bs4 import BeautifulSoup

s = Session()


class Materia:
    cod: str
    nome: str
    ch: int
    info: any

    def __init__(self, cod, nome, ch, info):
        self.cod = cod
        self.nome = nome
        self.ch = int(ch.replace('h', ''))
        self.info = info

    def __str__(self):
        return '{' + f'"cod" :  "{self.cod}",\n"nome" : "{self.nome}",\n"ch" :  {self.ch},\n"info" : "{self.info}"' + '\n}\n'


cod_unidades = 0  # FGA = 673, 0 para buscar todas.

sigaa_url: str = 'https://sigaa.unb.br/sigaa/public/componentes/busca_componentes.jsf'
data: dict() = {
    'form': 'form',
    'form:nivel': 'G',
    'form:tipo': 0,
    'form:j_id_jsp_190531263_11': None,
    'form:j_id_jsp_190531263_13': None,
    'form:unidades': cod_unidades,
    'form:btnBuscarComponentes': 'Buscar Componentes',
    'javax.faces.ViewState': 'j_id1'
}
s.get(sigaa_url)
r = s.post(sigaa_url, data=data, headers={
    'Content-Type': 'application/x-www-form-urlencoded'})
print(f'Request to {sigaa_url} returned status code: {r.status_code}.')
print('Parsing content...')

soup = BeautifulSoup(r.content, 'html.parser')
components = []

table_listagem = soup.select('table.listagem')[0]

for linha in table_listagem.select('tr'):
    for a in linha.select('a'):
        if a['title']:
            if 'Detalhes' in a['title']:
                component_info = a['onclick']
    dados = []
    for td in linha.select('td'):
        dados.append(td.text.replace('\n', ''))
    if (dados):
        components.append(
            Materia(cod=dados[0], nome=dados[1], ch=dados[3], info=component_info))


with open('materias.json', 'w') as f:
    f.write('{ "materias": [\n')
    f.write(components[-1].__str__())
    for component in components[1:]:
        f.write(',\n' + component.__str__())
    f.write('\n]}')
