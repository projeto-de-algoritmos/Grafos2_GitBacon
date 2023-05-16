# SIGAARush

**Número da Lista**: Dupla 06 (T01)<br>
**Conteúdo da Disciplina**: Grafos 2<br>

## Alunos

| Matrícula  | Aluno                                                                   |
|------------|-------------------------------------------------------------------------|
| 19/0112123 | [Lucas Gabriel Sousa Carmargo Paiva](https://github.com/lucasgabriel-2) |
| 20/0042327 | [Nicolas Chagas Souza](https://github.com/nszchagas)                    |

## Sobre

Esse projeto visa encontrar o caminho mais barato até uma matéria da UnB, onde o custo é determinado a partir do número de créditos da matéria.

## Screenshots

![Figura 1 - Tela inicial.](./assets/tela-inicial.png)

<center> Figura 1 - Tela Inicial.</center>

![Figura 2 - Busca em andamento.](./assets/busca1.png)

<center> Figura 2 - Exemplo de Busca.</center>

![Figura 3 - Busca em andamento.](./assets/busca2.png)

<center> Figura 3 - Exemplo de Busca.</center>

## Instalação

**Linguagem**: Typescript@4.9.4<br>
**Framework**: Angular@15.2.0<br>

Para rodar o projeto localmente é necessário ter Node (^20.0.0) e Angular (^15.2.0) instalado na máquina. Recomendamos a utilização do Node Version Manager (nvm) para instalação da versão correta do node.

```shell

nvm install 20.0.0
nvm use 20.0.0
npm install angular@15.2.0 -g

```

- É **necessário** instalar as dependências do projeto, executando o seguinte comando na pasta raiz do projeto (a mesma onde se encontra o [package.json](./package.json).

```shell
npm install 
```

- Para rodar o projeto, basta executar o comando abaixo na raiz do projeto.

```shell
npm run start 
```

> Esse comando executará o script start definido no [package.json](./package.json), ou seja, iniciará o servidor angular expondo a porta padrão: 4200.

> Confira o aplicativo rodando em: [http://localhost:4200](http://localhost:4200). :)

## Uso

Para usar o projeto, acesse a página ([local](http://localhost:4200) ou no [github](https://projeto-de-algoritmos.github.io/Grafos2_SIGAARush/)), preencha o departamento e a matéria, clique no botão de lupa e a busca será iniciada.

## Outros

A busca por requisitos simultâneos (por exemplo: FAC -> PED1 & TED1) não foi implementada, e esses requisitos foram desconsiderados na hora dos cálculos.

## Apresentação

<video src='./assets/gravacao.mp4'></video>

[Arquivo de apresentação](./assets/gravacao.mp4)

## Referências

[1] Tracing the Path in DFS, BFS, and Dijkstra’s Algorithm - Baeldung. Disponível no [link]&#40;<https://www.baeldung.com/cs/dfs-vs-bfs-vs-dijkstra&#41>;, acesso em 20/04/2023.
