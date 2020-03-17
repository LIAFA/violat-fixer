export default class AdjacencyList{
	static getAdjacencyList(adjacencyMatrix)
	{
		var list = [];

		for(var i = 0; i < adjacencyMatrix.length; i++)
		{
			list.push([]);
		}

		for(var i = 0; i < adjacencyMatrix.length; i++)
		{
			var v = [];
			for(var j = 0; j < adjacencyMatrix[i].length; j++)
			{
				if(adjacencyMatrix[i][j])
				{
					v.push(j);
				}
			}

			for(var j = 0; j < v.length; j++)
			{
				var inx = parseInt(v[j],10);
				list[i].push(inx);
			}
		}

		return list;
	}
}