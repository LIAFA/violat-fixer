export default class SCCResult{
	constructor(adjList, lowestNodeId)
	{
		this.adjList = adjList;
		this.lowestNodeId = lowestNodeId;
		this.nodeIDsOfSCC = new Set();
		if(this.adjList != null)
		{
			for(var i = this.lowestNodeId; i < this.adjList.length; i++)
			{
				if (this.adjList[i].length > 0)
				{
					this.nodeIDsOfSCC.add(parseInt(i,10));
				}
			}
		}
	}

	getAdjList()
	{
		return this.adjList;
	}

	getLowestNodeId()
	{
		return this.lowestNodeId;
	}
}