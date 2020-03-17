import AdjacencyList from './AdjacencyList'
import StrongConnectedComponents from './StrongConnectedComponents'
import SCCResult from './SCCResult'

export default class ElementaryCyclesSearch{
	constructor(matrix, graphNodes, threadMatrix, sourceMatrix)
	{
		this.cycles = null;
		this.blocked = null;
		this.B = null;
		this.stack = null;

		this.graphNodes = graphNodes;
		this.adjList = AdjacencyList.getAdjacencyList(matrix);;
		this.threadMatrix = threadMatrix;
		this.numOfThreads = threadMatrix[threadMatrix.length-1];
		this.sourceMatrix = sourceMatrix;
	}

	findAtomicSections(object)
	{
		var atomicSectionSet = new Set();

		for(var i = 0; i < this.cycles.length; i++)
		{
			var cycle = this.cycles[i];
			var decomposition = [];
			var atomicSection = [];
			var prevNode = parseInt(cycle[cycle.length-1], 10);
			var isAtomSec = false;

			for(var j = 0; j < cycle.length; j++)
			{
				var currentNode = parseInt(cycle[j], 10);
				if(this.threadMatrix[currentNode] == this.threadMatrix[prevNode]
					&& currentNode < prevNode)
				{
					if(isAtomSec)
					{
						atomicSection[atomicSection.length-1] = this.sourceMatrix[currentNode];
					}
					else
					{
						atomicSection.push(this.sourceMatrix[prevNode]);
						atomicSection.push(this.sourceMatrix[currentNode]);
						isAtomSec = true;
					}
				}
				else
				{
					if(isAtomSec)
					{
						isAtomSec = false;
						atomicSection.push((i+1).toString());
						decomposition.push(atomicSection);
						atomicSection = [];
					}
				}
				prevNode = currentNode;
			}
			if(isAtomSec)
			{
				isAtomSec = false;
				atomicSection.push((i+1).toString());
				decomposition.push(atomicSection);
				atomicSection = [];
			}
			atomicSectionSet.add(decomposition);
		}

		var k = 0;
		for (var it = atomicSectionSet.values(), val= null; val=it.next().value; ) 
		{
    		object.result += "------- DECOMPOSITION " + (k+1).toString() + " -------\n";
    		var i = 0;
    		for (var l = 0; l < val.length; l++)
    		{
    			object.result += "------- Atomic Section " + (i+1).toString() + " -------\n";
    			var as = val[l];
    			for (var j = 0; j < as.length; j++)
    			{
    				object.result += as[j] + "\n";
    			}
    			object.result += "\n";
    			i++;
    		}
    		k++;
		}
		return atomicSectionSet;
	}

	unblock(node)
	{
		this.blocked[node] = false;
		var Bnode = this.B[node];
		while (Bnode.length > 0)
		{
			var w = Bnode[0]
			Bnode.splice(0, 1);
			if(this.blocked[w])
			{
				this.unblock(w);
			}
		}
	}

	findCycles(v, s, adjList, mode)
	{
		var f = false;
		this.stack.push(v);
		this.blocked[v] = true;
		var visitedThreads = [];
		for(var i = 0; i < this.numOfThreads+1; i++)
		{
			visitedThreads.push(false);
		}

		for(var i = 0; i < adjList[v].length; i++)
		{
			var w = adjList[v][i];

			if (w == s)
			{
				var conflictEdgeExists = false;
				var isSimple = true;
				var prevThread = this.threadMatrix[s];
				var currentThread;

				for(var j = 0; j < this.stack.length; j++)
				{
					var index = this.stack[j];
					currentThread = this.threadMatrix[index];

					if (currentThread != prevThread)
					{
						conflictEdgeExists = true;
						if (visitedThreads[currentThread] == true)
						{
							isSimple = false;
							break;
						}
						visitedThreads[currentThread] = true;
					}
					prevThread = currentThread;
				}
				currentThread = this.threadMatrix[s];
				if (currentThread != prevThread)
				{
					conflictEdgeExists = true;
					if (visitedThreads[currentThread] == true)
					{
						isSimple = false;
					}
				}

				if (conflictEdgeExists && isSimple)
				{
					var cycle = [];
					for(var j = 0; j < this.stack.length; j++)
					{
						var index = this.stack[j];
						cycle.push(this.graphNodes[index]);
					}
					cycle.push(this.graphNodes[this.stack[0]]);
					this.cycles.push(cycle);
					if(mode == 1)
					{
						var a = "Cyclic\n"
						//console.log(a)
						return a;
					}
				}
				f = true;
			}
			else if(!this.blocked[w])
			{
				var b = this.findCycles(w, s, adjList, mode);
				if(mode == 1 && b == "Cyclic\n")
				{
					return b;
				}
				if(b)
				{
					f = true;
				}
			}
		}

		if (f)
		{
			this.unblock(v);
		}
		else
		{
			for(var i = 0; i < adjList[v].length; i++)
			{
				var w = adjList[v][i];
				if(!this.B[w].includes(v))
				{
					this.B[w].push(v);
				}
			}
		}

		this.stack.splice(this.stack.indexOf(v), 1);
		return f;
	}

	getElementaryCycles(mode, object)
	{
		this.cycles = [];
		this.blocked = [];
		this.B = [];
		this.stack = [];
		var sccs = new StrongConnectedComponents(this.adjList);
		var s = 0;

		for(var i = 0; i < this.adjList.length; i++)
		{
			this.blocked.push(false);
			this.B.push(null);
		}

		while(true)
		{
			var sccResult = sccs.getAdjacencyList(s);
			if (sccResult != null && sccResult.getAdjList() != null)
			{
				var scc = sccResult.getAdjList();
				s = sccResult.getLowestNodeId();
				for (var j = 0; j < scc.length; j++)
				{
					if((scc[j] != null) && (scc[j].length > 0))
					{
						this.blocked[j] = false;
						this.B[j] = [];
					}
				}

				var a = this.findCycles(s, s, scc, mode);
				//console.log(a);
				if(mode == 1 && a == "Cyclic\n")
				{	
					//console.log(a);
					return a;
				}
				s++;
			}
			else
			{
				break;
			}
		}

		this.findAtomicSections(object);
		return this.cycles;
	}
}
