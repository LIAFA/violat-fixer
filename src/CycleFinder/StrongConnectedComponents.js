import SCCResult from './SCCResult'
import AdjacencyList from './AdjacencyList'

export default class StrongConnectedComponents{
	constructor(adjList)
	{
		this.adjListOriginal = adjList;
		this.adjList = null;
		this.visited = null;
		this.stack = null;
		this.lowlink = null;
		this.number = null;
		this.sccCounter = 0
		this.currentSccs = null;
	}

	getStrongConnectedComponents(root)
	{
		this.sccCounter++;
		this.lowlink[root] = this.sccCounter;
		this.number[root] = this.sccCounter;
		this.visited[root] = true;
		this.stack.push(parseInt(root, 10));

		for (var i = 0; i < this.adjList[root].length; i++)
		{
			var w = this.adjList[root][i];
			if(!this.visited[w])
			{
				this.getStrongConnectedComponents(w);
				this.lowlink[root] = Math.min(this.lowlink[root], this.lowlink[w])
			}
			else if(this.number[w] < this.number[root])
			{
				if(this.stack.includes(parseInt(w, 10)))
				{
					this.lowlink[root] = Math.min(this.lowlink[root], this.number[w]);
				}
			}
		}

		if ((this.lowlink[root] == this.number[root]) && (this.stack.length > 0)) 
		{
			var next = -1;
			var scc = [];
			do
			{
				next = parseInt(this.stack[this.stack.length-1], 10);
				this.stack.splice(this.stack.length-1);
				scc.push(next);
			} while (this.number[next] > this.number[root]);

			if(scc.length > 1)
			{
				this.currentSccs.push(scc);
			}
		}
	}

	getAdjList(nodes)
	{
		var lowestIdAdjacencyList = null;
		if (nodes != null)
		{
			lowestIdAdjacencyList = [];
			for (var i = 0; i < this.adjList.length; i++)
			{
				lowestIdAdjacencyList.push([]);
			}
			for (var i = 0; i < nodes.length; i++)
			{
				var node = parseInt(nodes[i], 10);
				for (var j = 0; j < this.adjList[node].length; j++)
				{
					var succ = parseInt(this.adjList[node][j], 10);
					if (nodes.includes(succ))
					{
						lowestIdAdjacencyList[node].push(succ);
					}
				}
			}
		}

		return lowestIdAdjacencyList;
	}

	getLowestIdComponent()
	{
		var min = this.adjList.length;
		var curScc = null;

		for (var i = 0; i < this.currentSccs.length; i++)
		{
			var scc = this.currentSccs[i];
			for (var j = 0; j < scc.length; j++)
			{
				var  node = parseInt(scc[j], 10);
				if (node < min)
				{
					curScc = scc;
					min = node;
				}
			}
		}
		return curScc;
	}

	makeAdjListSubgraph(node)
	{
		this.adjList = [];
		for (var i = 0; i < this.adjListOriginal.length; i++)
		{
			this.adjList.push([]);
		}
		for (var i = node; i < this.adjListOriginal.length; i++)
		{
			var successors = [];
			for (var j = 0; j < this.adjListOriginal[i].length; j++)
			{
				if (this.adjListOriginal[i][j] >= node)
				{
					successors.push(parseInt(this.adjListOriginal[i][j], 10));
				}
			}
			if(successors.length > 0)
			{
				for (var j = 0; j < successors.length; j++)
				{
					var succ = parseInt(successors[j], 10);
					this.adjList[i].push(succ);
				}
			}
		}
	}

	getAdjacencyList(node)
	{
		this.visited = [];
		this.lowlink = [];
		this.number = [];
		this.stack = [];
		this.currentSccs = [];

		for(var i = 0; i < this.adjListOriginal.length; i++)
		{
			this.visited.push(false);
			this.lowlink.push(0);
			this.number.push(0);
		}

		this.makeAdjListSubgraph(node);

		for(var i = node; i < this.adjListOriginal.length; i++)
		{
			if (!this.visited[i])
			{
				this.getStrongConnectedComponents(i);
				var nodes = this.getLowestIdComponent();
				if (nodes != null && !nodes.includes(parseInt(node,10)) && !nodes.includes(parseInt((node + 1), 10)))
				{
					return this.getAdjacencyList(node + 1);
				}
				else
				{
					var adjacencyList = this.getAdjList(nodes);
					if(adjacencyList != null)
					{
						for (var j = 0; j < this.adjListOriginal.length; j++)
						{
							if(adjacencyList[j].length > 0)
							{
								return new SCCResult(adjacencyList, j);
							}
						}
					}
				}
			}
		}
		return null;
	}
}

// var adjMatrix = [];

// for(var i = 0; i < 10; i++)
// {
// 	adjMatrix.push([])
// 	for(var j = 0; j < 10; j++)
// 	{
// 		adjMatrix[i].push(false);
// 	}
// }

// adjMatrix[0][1] = true;
// adjMatrix[1][2] = true;
// adjMatrix[2][0] = true; 
// adjMatrix[2][6] = true;
// adjMatrix[3][4] = true;
// adjMatrix[4][5] = true; 
// adjMatrix[4][6] = true;
// adjMatrix[5][3] = true;
// adjMatrix[6][7] = true;
// adjMatrix[7][8] = true;
// adjMatrix[8][6] = true;
// adjMatrix[6][1] = true;

// var adjList = AdjacencyList.getAdjacencyList(adjMatrix);
// var scc = new StrongConnectedComponents(adjList);
// for(var i = 0; i < adjList.length; i++)
// {
// 	console.log("i: " + i.toString());
// 	var r = scc.getAdjacencyList(i);
// 	if(r != null)
// 	{
// 		var al = scc.getAdjacencyList(i).getAdjList();
// 		for(var j = i; j < al.length; j++)
// 		{
// 			if(al[j].length > 0)
// 			{
// 				process.stdout.write("j: " + j.toString());
// 				for(var k = 0; k < al[j].length; k++)
// 				{
// 					process.stdout.write(" _" + al[j][k].toString());
// 				}
// 				console.log();
// 			}
// 		}
// 		console.log();
// 	}
// }