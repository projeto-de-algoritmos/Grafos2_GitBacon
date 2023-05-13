class Edge{
  constructor (nextNode, weight){
  this.nextNode =  nextNode;
  this.weight = weight;
  }
}

class Graph{
  constructor(adjacencyList){
      this.adjacencyList = adjacencyList;
  }

  addNode(newNode){   
      this.adjacencyList[newNode] = [];
  }

  addEdge(startNode, nextNode, weight){
      let newEdge = new Edge(nextNode, weight);
      this.adjacencyList[startNode].push(newEdge);
  }

}

function dijkstra (graph, startNode){
  //Os vértices, nos vetores a seguir, são considerados nas ordens que estão no grafo,
  //logo caso o vétice A seja o primeiro no grafo ele está representado por [0]

  //Índex do melhor vertex para chegar em um outro vértice (considerando o menor caminho)
  let pa = [];

  //Menor distância de um vértice até o startNode
  let distanceToOrigin = [];

  //Vetor para verificar se um vértice está maduro(já se explorou todos vértices que esse vertice consegue alcançar)
  let mature = [];

  //lista de nos
  let nodes = Object.keys(graph.adjacencyList);

  //Inicializar as variáveis passando por todos os nos
  for(let i = 0; i < nodes.length; i++){
      //origem para chegar ao vértice v não é nenhum nó
      pa[i] = -1;
      //vértice v não está maduro
      mature[i] = false;
      //distancia para chegar ao vértice v é infinita
      distanceToOrigin[i] = Infinity;        
  }

  //Se chega no startNode pelo próprio startNode
  pa[nodes.indexOf(startNode)] = nodes.indexOf(startNode);

  //Distância do startNode = 0, pois se parte do startNode
  distanceToOrigin[nodes.indexOf(startNode)] = 0;
  
  while(true){
      //Caminho mínimo é infinito
      let minPath = Infinity;

      //Vértice de saida que será escolhido
      let y;

      //Verifica qual o próximo vértice irá calcular para chegar
      for(let z = 0; z < nodes.length; z++){
          
          //Se o vértice z está maduro continue
          if(mature[z]){
              continue
          }

          if(distanceToOrigin[z] < minPath){
              minPath = distanceToOrigin[z];

              //O vértice que irei explorar agora é o z
              y = z;
          }
      }

      //Caso não haja nenhum vértice que tenha distâcia menor que infinito
      if(minPath === Infinity){
          break;
      }

      //Qual nó y corresponde
      let yNode = Object.keys(graph.adjacencyList)[y];

      //Lista de adjacência de y
      let yList = graph.adjacencyList[yNode];

      //Percorre-se todas lista de adjacência do vértice y 
      for (let i = 0; i < yList.length; i++){

          //Se o vertice na lista de adjacencia está maduro não preciso olhar mais ele
          if(mature[yList[i].nextNode]){
              continue;
          }

          //Index do nó que estou visitando
          let indexNodeVisited = nodes.indexOf(yList[i].nextNode)

          //Se o custo para chegar em y mais a aresta da lista de adj até o nó
          //for menor que a distância para se chegar ao vértice de destino ela se 
          //torna a nova disância para se chegar ao vértice de destino
          if(distanceToOrigin[y] + yList[i].weight < distanceToOrigin[indexNodeVisited]){
              distanceToOrigin[indexNodeVisited] = distanceToOrigin[y] + yList[i].weight;
              pa[indexNodeVisited] = y;
          }
      }

      mature[y] = true;
  }

  return {pa, distanceToOrigin};
  
}

//Construção de um grafo

let Edge1 = new Edge('B', 1);
let Edge2 = new Edge('D', 2); 
let Edge3 = new Edge('C', 1);
let Edge4 = new Edge('D', 3);
let Edge5 = new Edge('E', 1);
let Edge6 = new Edge('E', 2);

adjacencyList1 = {
  'A': [Edge1, Edge2],
  'B': [Edge3],
  'C': [Edge4, Edge5],
  'D': [Edge6],
  'E': []
}

let graph = new Graph (adjacencyList1);

//Impressão de um grafo
console.log('Grafo construido:');
for (let node in graph.adjacencyList) {
  console.log(node, graph.adjacencyList[node]);
}

console.log('\n');

//Impressão do dijkstra
let {pa, distanceToOrigin } = dijkstra(graph, "A");

//Impressão dos vértices de partida
console.log('Index do ultimo vértice antes de chegar no vertice [i]')
console.log(pa);
console.log('\n');

//Impressão da menor distância para se chegar ao vértice [i]
console.log('Menor distância para se chegar ao vértice [i]')
console.log(distanceToOrigin);