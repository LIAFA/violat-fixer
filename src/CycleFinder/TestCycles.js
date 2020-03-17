import ElementaryCyclesSearch from './ElementaryCyclesSearch'

export function generateCycles(content, object, atomicOutcomes)
{
	var d = {};
	var order = 1;
	var traceID = 1;
	var prevThreadId = 0;

	var graphInfo = [];
	var lastline = [];

	for(var i = 0; i < object.numOfThreads+1; i++)
	{
		lastline.push("");
	}

	var execNodeSourceDict = {};

	var lines = content.split("\n");

	for(var i = 1; i < lines.length; i++)
	{
		var line = lines[i];
		if (!(line.includes("getfield") || line.includes("putfield") ||
			line.includes("return") || line.includes("invoke") ||
			line.includes("---------")))
		{
			var threadId = parseInt(line.substring(0, line.indexOf(":")).trim(), 10);
			var output = line.substring(line.indexOf("]")+1, line.length).trim();
			lastline[threadId] = line + "\n";
		}
		else if(line.includes("TRACE") || i == lines.length-1)
		{
			if(atomicOutcomes.includes(output))
			{
				object.goodExecutions.push(1);
			}
			else
			{
				object.goodExecutions.push(0);
			}
			var result = "";
			var tempResult = "";
			var node = 0;
			var nodeThreadDict = {};
			for(var j = 0; j < Object.keys(d).length; j++)
			{

				for(var k = 0; k < d[j+1].length-1; k++)
				{
					if (object.goodExecutions[traceID-1] == 0)
					{
						tempResult += (node+1).toString() + " " + node.toString() + "\n";
					}
					tempResult += (node).toString() + " " + (node+1).toString() + "\n";
					nodeThreadDict[node] = j+1;
					node++;
				}
				nodeThreadDict[node] = j+1;
				node++;
			}

			for(var j = 0; j < Object.keys(nodeThreadDict).length; j++)
			{
				result += j.toString() + " " + nodeThreadDict[j].toString() + "\n";
			}
			result += "\n";

			var nodeSourceDict = {};
			var nodeEventDict = {};

			for(var j = 0; j < Object.keys(d).length-1; j++)
			{
				var firstThread = d[j+1];
				for(var k = j+1; k < Object.keys(d).length; k++)
				{
					var secondThread = d[k+1];

					for(var eventId1 = 0; eventId1 < firstThread.length; eventId1++)
					{
						var event1 = firstThread[eventId1];
						var properties1 = event1.split(" ");
						var accesType1 = properties1[0];
						var fieldName1 = properties1[1];
						var source1 = properties1[2];
						var traceId1 = properties1[4];
						var nodeId1 = 0;

						for(var m = 0; m < Object.keys(d).length; m++)
						{
							if(m == j)
							{
								break
							}
							var thread = d[m+1]
							nodeId1 += thread.length;
						}
						nodeId1 += firstThread.indexOf(event1);

						if (!(nodeId1 in nodeSourceDict))
						{
							nodeSourceDict[nodeId1] = fieldName1 + " " + source1 + " " + traceId1;
							nodeEventDict[nodeId1] = accesType1 + " " + fieldName1 + " " + source1;
						}

						if(accesType1 == "putfield")
						{
							var order1 = parseInt(properties1[3], 10);
							for(var eventId2 = 0; eventId2 < secondThread.length; eventId2++)
							{
								var event2 = secondThread[eventId2];
								var properties2 = event2.split(" ");
								var accesType2 = properties2[0];
								var fieldName2 = properties2[1];
								var source2 = properties2[2];
								var order2 = parseInt(properties2[3], 10);

								if(fieldName1 == fieldName2 && order1 < order2)
								{
									var nodeId2 = 0;
									for(var m = 0; m < Object.keys(d).length; m++)
									{
										if(m == k)
										{
											break
										}
										var thread = d[m+1]
										nodeId2 += thread.length;
									}
									nodeId2 += secondThread.indexOf(event2);
									tempResult += nodeId1.toString() + " " + nodeId2.toString() + "\n";
								}
							}
						}

						else if(accesType1 == "getfield")
						{
							var order1 = parseInt(properties1[3], 10);
							for(var eventId2 = 0; eventId2 < secondThread.length; eventId2++)
							{
								var event2 = secondThread[eventId2];
								var properties2 = event2.split(" ");
								var accesType2 = properties2[0];
								var fieldName2 = properties2[1];
								var source2 = properties2[2];
								var order2 = parseInt(properties2[3], 10);

								if(accesType2 == "putfield" && fieldName1 == fieldName2 && order1 < order2)
								{
									var nodeId2 = 0;
									for(var m = 0; m < Object.keys(d).length; m++)
									{
										if(m == k)
										{
											break
										}
										var thread = d[m+1]
										nodeId2 += thread.length;
									}
									nodeId2 += secondThread.indexOf(event2);
									tempResult += nodeId1.toString() + " " + nodeId2.toString() + "\n";
								}
							}
						}
					}
					for(var eventId2 = 0; eventId2 < secondThread.length; eventId2++)
					{
						var event2 = secondThread[eventId2];
						var properties2 = event2.split(" ");
						var accesType2 = properties2[0];
						var fieldName2 = properties2[1];
						var source2 = properties2[2];
						var nodeId2 = 0;
						var traceId2 = properties2[4];
						for(var m = 0; m < Object.keys(d).length; m++)
						{
							if(m == k)
							{
								break
							}
							var thread = d[m+1]
							nodeId2 += thread.length;
						}
						nodeId2 += secondThread.indexOf(event2);
						if (!(nodeId2 in nodeSourceDict))
						{
							nodeSourceDict[nodeId2] = fieldName2 + " " + source2 + " " + traceId2;
							nodeEventDict[nodeId2] = accesType2 + " " + fieldName2 + " " + source2;
						}

						if(accesType2 == "putfield")
						{
							var order2 = parseInt(properties2[3], 10);
							for(var eventId1 = 0; eventId1 < firstThread.length; eventId1++)
							{
								var event1 = firstThread[eventId1];
								var properties1 = event1.split(" ");
								var accesType1 = properties1[0];
								var fieldName1 = properties1[1];
								var source1 = properties1[2];
								var order1 = parseInt(properties1[3], 10);

								if(fieldName1 == fieldName2 && order2 < order1)
								{
									var nodeId1 = 0;
									for(var m = 0; m < Object.keys(d).length; m++)
									{
										if(m == j)
										{
											break
										}
										var thread = d[m+1]
										nodeId1 += thread.length;
									}
									nodeId1 += firstThread.indexOf(event1);
									tempResult += nodeId2.toString() + " " + nodeId1.toString() + "\n";
								}
							}
						}
						else if(accesType2 == "getfield")
						{
							var order2 = parseInt(properties2[3], 10);
							for(var eventId1 = 0; eventId1 < firstThread.length; eventId1++)
							{
								var event1 = firstThread[eventId1];
								var properties1 = event1.split(" ");
								var accesType1 = properties1[0];
								var fieldName1 = properties1[1];
								var source1 = properties1[2];
								var order1 = parseInt(properties1[3], 10);

								if(accesType1 == "putfield" && fieldName1 == fieldName2 && order2 < order1)
								{
									var nodeId1 = 0;
									for(var m = 0; m < Object.keys(d).length; m++)
									{
										if(m == j)
										{
											break
										}
										var thread = d[m+1]
										nodeId1 += thread.length;
									}
									nodeId1 += firstThread.indexOf(event1);
									tempResult += nodeId2.toString() + " " + nodeId1.toString() + "\n";
								}
							}
						}
					}
				}
			}

			var numOfVertices = node;
			execNodeSourceDict[traceID] = nodeEventDict;
			for(var j in nodeSourceDict)
			{
				result += j.toString() + " " + nodeSourceDict[j].toString() + "\n"; 
			}
			result += "\n";
			result += tempResult.trim();
			result += "\n\n";
			result += numOfVertices;
			graphInfo.push(result);

			d = {};
			order = 1;
			traceID++;
			lastline[threadId] = line + "\n";
		}
		else if(line.includes("getfield") && parseInt(line.substring(0, line.indexOf(":")).trim(), 10) != 0)
		{
			var threadId = parseInt(line.substring(0, line.indexOf(":")).trim(), 10);
			if (!(threadId in d))
			{
				d[threadId] = [];
				d[threadId].push(line.substring(line.indexOf("getfield"), line.length).trim() + " " + order.toString() + " " + threadId);
				lastline[threadId] = line + "\n";
			}
			else
			{
				if(lastline[threadId].includes(line.substring(line.indexOf("getfield"), line.length).trim()))
				{
					d[threadId][d[threadId].length-1] = line.substring(line.indexOf("getfield"), line.length).trim() + " " + order.toString() + " " + threadId;
					lastline[threadId] = line + "\n";
				}
				else
				{
					d[threadId].push(line.substring(line.indexOf("getfield"), line.length).trim() + " " + order.toString() + " " + threadId);
					lastline[threadId] = line + "\n";
				}
			}
			prevThreadId = threadId;
		}
		else if(line.includes("putfield") && parseInt(line.substring(0, line.indexOf(":")).trim(), 10) != 0)
		{
			var threadId = parseInt(line.substring(0, line.indexOf(":")).trim(), 10);
			if (!(threadId in d))
			{
				d[threadId] = [];
				d[threadId].push(line.substring(line.indexOf("putfield"), line.length).trim() + " " + order.toString() + " " + threadId);
				lastline[threadId] = line + "\n";
			}
			else
			{
				if(lastline[threadId].includes(line.substring(line.indexOf("putfield"), line.length).trim()))
				{
					d[threadId][d[threadId].length-1] = line.substring(line.indexOf("putfield"), line.length).trim() + " " + order.toString() + " " + threadId;
					lastline[threadId] = line + "\n";
				}
				else
				{
					d[threadId].push(line.substring(line.indexOf("putfield"), line.length).trim() + " " + order.toString() + " " + threadId);
					lastline[threadId] = line + "\n";
				}
			}
			prevThreadId = threadId;
		}

		order++;
	}

	return graphInfo;
}

export function TestCycles(mode, info) 
{
	var object = {
		result: ""
	}
	var mode = mode;

	var nodes = [];
	var adjMatrix = [];
	var threadMatrix = [];
	var sourceMatrix = [];

	var InfoList = info.split("\n\n");

	var threads = InfoList[0].split("\n");
	var sources = InfoList[1].split("\n");
	var edges = InfoList[2].split("\n");
	var numOfVertices = InfoList[3];

	for (var i = 0; i < numOfVertices; i++)
	{
		nodes.push(i.toString());
		threadMatrix.push(-1);
		sourceMatrix.push("");
		adjMatrix.push([]);
		for (var j = 0; j < numOfVertices; j++)
		{
			adjMatrix[i].push(false);
		}
	}

	for (var i = 0; i < threads.length; i++)
	{
		var node = parseInt(threads[i].split(" ")[0], 10);
		var thread = parseInt(threads[i].split(" ")[1], 10);
		threadMatrix[node] = thread;
	}

	for (var i = 0; i < sources.length; i++)
	{
		var node = parseInt(sources[i].split(" ")[0], 10);
		var source = sources[i].split(" ")[1] + " " + sources[i].split(" ")[2] + " " + sources[i].split(" ")[3];
		sourceMatrix[node] = source;
	}

	for (var i = 0; i < edges.length; i++)
	{
		var node1 = parseInt(edges[i].split(" ")[0], 10);
		var node2 = parseInt(edges[i].split(" ")[1], 10);
		adjMatrix[node1][node2] = true;
	}

	var ecs = new ElementaryCyclesSearch(adjMatrix, nodes, threadMatrix, sourceMatrix);
	var cycles = ecs.getElementaryCycles(mode, object);
	if(mode == 0)
	{
		if(cycles.length == 0)
		{
			object.result += "No Cycle\n";
		}

		for (var i = 0; i < cycles.length; i++)
		{
			object.result += "CYCLE" + (i+1).toString() + " ==> ";
			var cycle = cycles[i];
			for (var j = 0; j < cycle.length; j++)
			{
				var node = cycle[j].toString();
				if(j < cycle.length-1)
				{
					object.result += node + " ";
				}
				else
				{
					object.result += node + "\n";
				}
			}
		}
	}
	else
	{
		if(cycles.includes("Cyclic"))
		{
			object.result += "Cyclic\n";
		}

		else
		{
			object.result += "No Cycle\n";
		}
	}
	return object.result;	
}

export function runCycleFinderGE(graphInfos, object, outputs)
{
	var outStr = ""
	for (var graphId = 0; graphId < object.goodExecutions.length; graphId++)
	{
		if (object.goodExecutions[graphId] == 1)
		{
			outStr += "--------------EXECUTION" + (graphId+1).toString() + "--------------\n";
			outStr += "Good Execution!!\n";

			continue;
		} 
		else
		{
			outStr += "--------------EXECUTION" + (graphId+1).toString() + "--------------\n";
			outStr += "Output: " + outputs[graphId] + "\n";

			var atomicSections = this.TestCycles(0, graphInfos[graphId]);
			var lines = atomicSections.split("\n");
			var cycleIdMap = [];
			var decompMap = {};
			var m = -1;
			var save = false;
			for (var idx = 0; idx < lines.length; idx++)
			{
				var line = lines[idx];
				var numStr = line.trim();
				if ('0' <= numStr && '9' >= numStr)
				{
					var num = parseInt(numStr, 10);
					if (!(num in decompMap))
					{
						decompMap[num] = result;
					}
					else
					{
						decompMap[num] += result;
					}
					result = "";
				}
				else if(line.includes("DECOMPOSITION"))
				{
					save = true;
					m++;
					var result = line + "\n";
				}
				else if(line.includes("CYCLE"))
				{
					save = false;
					var cycleStr = line.substring(line.indexOf("==> ")+4, line.length).trim();
					var cycleList = cycleStr.split(" ");
					for(var i = 0; i < cycleList.length; i++)
					{
						cycleList[i] = parseInt(cycleList[i], 10);
					}
					cycleIdMap.push(cycleList);
				}
				else if(save)
				{
					result += line + "\n";
				}
			}
			var cycleIdMap2 = [];
			var outStr2 = ""

			for(var lstId = 0; lstId < cycleIdMap.length; lstId++)
			{
				var temp = [];
				for(var i = 0; i < cycleIdMap[lstId].length; i++)
				{
					temp.push(cycleIdMap[lstId][i].toString());
				}
				cycleIdMap2.push(temp);

				outStr2 += "CYCLE -> "
				for(var i = 0; i < cycleIdMap[lstId].length; i++)
				{
					outStr2 += cycleIdMap[lstId][i].toString() + " ";
				}

				outStr2 += "\n";
				outStr2 += decompMap[lstId+1];
			}

			outStr += outStr2 + "\n";
		}
	}
	const fs = require('fs');
	var path2 = require('path');
	var filename = process.cwd();
	var curDic = path2.dirname(path2.dirname(process.mainModule.filename));
	fs.writeFile(curDic + '/Outputs/AtomicSections.txt', outStr, (err) => 
	{      
	    // In case of a error throw err. 
	    if (err) throw err; 
	});
	return outStr;
}

export function runCycleFinderBE(eliminated, asDict, graphInfos, object)
{
	var cache = {};
	var noOfPreventCycles = {};
	var a = 0;
	for (var traceID in asDict)
	{
		var trace = asDict[traceID];
		noOfPreventCycles[traceID] = [];
		for (var i = 0; i < trace.length; i++)
		{
			noOfPreventCycles[traceID].push(0);
		}
		if (trace.length > 0)
		{
			var b = 0;
			for(var decompId = 0; decompId < trace.length; decompId++)
			{
				if(eliminated[a][b] == 0)
				{
					var decomp = trace[decompId];
					if(!(decomp.toString() in cache))
					{
						for(var asRangeId = 0; asRangeId < decomp.length; asRangeId++)
						{
							var asRange = decomp[asRangeId];
							var startLine = asRange[0];
							var endLine = asRange[1];
							var graphInfos2 = [...graphInfos];
							for(var graphInfoId = 0; graphInfoId < graphInfos2.length; graphInfoId++)
							{
								if (object.goodExecutions[graphInfoId] == 0)
								{
									continue;
								}
								var decompCommand = graphInfos2[graphInfoId];
								var nodeSourceList = decompCommand.split("\n\n")[1].split("\n")

								var done = false;

								for(var nodeSourceStrId = 0; nodeSourceStrId < nodeSourceList.length; nodeSourceStrId++)
								{
									var nodeSourceStr  = nodeSourceList[nodeSourceStrId];
									var nodeSource = nodeSourceStr.split(" ");
									var node = nodeSource[0];
									var source = nodeSource[1] + nodeSource[2];

									if(source.includes(".java:" + startLine.toString()))
									{
										var startNode = node;
										done = true;
									}
									else if(source.includes(".java:" + endLine.toString()) && done)
									{
										var endNode = node;
										var t = 1;
										if ((nodeSourceStrId+t) < nodeSourceList.length)
										{
											var tempSource = nodeSourceList[nodeSourceStrId+t].split(" ")[1];
											while (tempSource.includes(".java:" + endLine.toString()))
											{
												var endNode = (parseInt(endNode,10) + 1).toString();
												if ((nodeSourceStrId+t+1) < nodeSourceList.length)
												{
													t++;
													tempSource = nodeSourceList[nodeSourceStrId+t].split(" ")[1];
												}
												else
												{
													break;
												}
											}
										}

										var commandBreak = decompCommand.split("\n\n");

										var result = "";
										var wNode1 = parseInt(endNode, 10);
										var wNode2 = wNode1 - 1;

										while (wNode2 >= parseInt(startNode, 10))
										{
											result += wNode1.toString() + " " + wNode2.toString() + "\n"
											wNode1 = wNode2
											wNode2 = wNode1 - 1
										}

										commandBreak[2] = result + commandBreak[2];
										decompCommand = commandBreak.join("\n\n");
										graphInfos2[graphInfoId] = decompCommand
										done = false;
									}
								}
							}
						}

						var allContent = ""
						for(var graphInfoId = 0; graphInfoId < graphInfos2.length; graphInfoId++)
						{
							if (object.goodExecutions[graphInfoId] == 0)
							{
								continue;
							}
							var atomicSections = this.TestCycles(1, graphInfos2[graphInfoId]);
							allContent += atomicSections;
						}
						//console.log(allContent);
						noOfPreventCycles[traceID][decompId] = (allContent.match(/Cyclic/g) || []).length;
						cache[decomp.toString()] = noOfPreventCycles[traceID][decompId];
					}
					else
					{
						noOfPreventCycles[traceID][decompId] = cache[decomp.toString()];
					}
				}
				b++;
			}
		}
		a++;	
	}

	var result = "";

	//console.log(eliminated);
	var a = 0;
	for(var traceIdx in asDict)
	{
		var b = 0;
		var trace = asDict[traceIdx];
		if(trace.length > 0)
		{
			result += "TRACE " + traceIdx.toString() + ")\n";
			for(var decompId = 0; decompId < trace.length; decompId++)
			{
				if(eliminated[a][b] == 0)
				{
					var decomp = trace[decompId];
					result += "\t[ ";
					for (var i = 0; i < decomp.length; i++)
					{
						var as = decomp[i];
						result += "[" + as[0].toString() + ", " + as[1].toString() + "]";
						if(i != decomp.length-1)
						{
							result += " ";
						}
					}
					result += " ] ==> " + noOfPreventCycles[traceIdx][decompId].toString() + "\n";
				}
				b++;
			}
		}
		a++;
	}
	//console.log(result);
	const fs = require('fs');
	var path2 = require('path');
	var filename = process.cwd();
	var curDic = path2.dirname(path2.dirname(process.mainModule.filename));
	fs.writeFile(curDic + '/Outputs/FinalResults.txt', result, (err) => 
	{      
	    // In case of a error throw err. 
	    if (err) throw err; 
	});
	return result
}



