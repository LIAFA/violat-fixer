export function outputFilter(content, object, filteredString, outcomesSet) 
{
	var lines = content.split("\n");
	var filtered = "";
	var skipUntil = lines.findIndex(element => element === "----------------------------------- [1] forward: 0 new");
	//console.log(skipUntil);
	for(var i = skipUntil; i < lines.length; i++)
	{
		var line = lines[i];
		if (line[0] >= '0' && line[0] <= '9')
		{
			var threadId = line.substring(0, line.search(":"))
			if(threadId > object.numOfThreads)
			{
				object.numOfThreads = threadId;
			}
		}

		if(line.includes("-----------------------------------"))
		{
			if(!line.includes("search finished"))
			{
				filtered += line + "\n";
			}
		}

		else if(line.includes("getfield") || line.includes("putfield"))
		{
			var dontadd = false;
			for(var j = 0; j < filteredString.length; j++)
			{
				if(line.includes(filteredString[j]))
				{
					dontadd = true;
					break;
				}
			}

			if(!dontadd)
			{
				filtered += line + "\n"
			}
		}

		else if(line.includes("invokevirtual") || line.includes("return"))
		{
			var dontadd = false;
			for(var j = 0; j < filteredString.length; j++)
			{
				if(line.includes(filteredString[j]))
				{
					dontadd = true;
					break;
				}
			}

			if(!dontadd)
			{
				filtered += line + "\n"
			}
		}

		else
		{
			for(var j = 0; j < outcomesSet.length; j++)
			{
				if(line.includes(outcomesSet[j]))
				{
					filtered += line + "\n";
					break;
				} 
			} 
		}

	}
	const fs = require('fs')
	var path2 = require('path');
	var filename = process.cwd();
	var curDic = path2.dirname(path2.dirname(process.mainModule.filename));
	fs.writeFile(curDic + '/Outputs/OutputsFiltered.txt', filtered, (err) => 
	{      
	    // In case of a error throw err. 
	    if (err) throw err; 
	})
	return filtered;
	//console.log(filtered);
}

export function traceFilter(content, object, methods, fileNameOrg) 
{
	var fixed = "";
	var change = [];
	var sourceLine = [];
	var lines = content.split("\n");

	for(var i = 0; i < object.numOfThreads; i++)
	{
		change.push(false);
		sourceLine.push(0);
	}

	for(var i = 0; i < lines.length; i++)
	{
		var line = lines[i];
		if ("0" <= line[0] && "9" >= line[0])
		{
			if(!line.includes(fileNameOrg + ".java:"))
			{
				continue;
			}
			else
			{
				var threadId = parseInt(line.substring(0, line.indexOf(":")).trim(),10);
				if (line.includes("invoke"))
				{
					var tempLine = line.substring(line.indexOf("invoke"), line.length)
					var tempList = tempLine.split(" ");
					if (change[threadId])
					{
						for(var j = 0; j < methods.length; j++)
						{
							var method = methods[j];
							if (tempList[1].includes(method))
							{
								change[threadId-1] = false;
							}
						}
					}
					for(var j = 0; j < methods.length; j++)
					{
						var method = methods[j];
						if (tempList[2].includes(method) && !tempList[1].includes(method))
						{
							change[threadId-1] = true;
							sourceLine[threadId-1] = line.trim().substring(line.indexOf(".java:")+6, line.length-1);
						}
					}
					fixed += line += "\n";
				}
				else if(line.includes("getfield") || line.includes("putfield"))
				{
					if(line.includes("getfield"))
					{
						tempLine = line.substring(line.indexOf("getfield"), line.length);
					}
					else
					{
						tempLine = line.substring(line.indexOf("putfield"), line.length);
					}
					tempList = tempLine.split(" ");
					if (change[threadId-1])
					{
						for(var j = 0; j < methods.length; j++)
						{
							var method = methods[j];
							if (tempList[2].includes(method))
							{
								change[threadId-1] = false;
							}
						}
						if (change[threadId-1] && line.indexOf(".java:") >= 0)
						{
							line = line.substring(0, line.indexOf(".java:")+6) + sourceLine[threadId-1] + ")"
						}
					}
					fixed += line + "\n";
				}
				else
				{
					fixed += line + "\n";
				}
			}
		}
		else
		{
			fixed += line + "\n";
		}
	}
	//console.log(fixed);
	const fs = require('fs')
	var path2 = require('path');
	var filename = process.cwd();
	var curDic = path2.dirname(path2.dirname(process.mainModule.filename));
	fs.writeFile(curDic + '/Outputs/OutputsFilteredTracesFixed.txt', fixed.trim(), (err) => 
	{      
	    // In case of a error throw err. 
	    if (err) throw err; 
	})
	return fixed.trim();
}

export function arraysEqual(a, b) 
{
	if (a === b) 
	{
		return true;
	}
    if (a.length != b.length) 
    {
  	    return false;
    }
    for (var i = 0; i < a.length; ++i) 
    {
        if (a[i] !== b[i]) 
        {
    	    return false;
        }
    }
    return true;
}

export function arraysOfArraysEqual(a, b) 
{
	if (a === b) 
  	{
  		return true;
  	}
	if (a.length != b.length) 
  	{
  		return false;
  	}
  	for (var i = 0; i < a.length; i++) 
	{
		var found = false;
		for (var j = 0; j < b.length; j++) 
		{
	    	if (this.arraysEqual(a[i], b[i])) 
	    	{
	    		found = true;
	    		break;
	    	}
	    }
	    if(!found)
	    {
	    	return false;
	    }
	}
	return true;
}

export function subsume(asDict)
{
	var a = 0;
	var eliminated = [];
	for(var k in asDict)
	{
		var trace = asDict[k];
		eliminated.push([]);
		for(var i = 0; i < trace.length; i++)
		{
			eliminated[a].push(0);
		}
		for(var decomp1Id = 0; decomp1Id < trace.length; decomp1Id++)
		{
			var decomp1 = trace[decomp1Id];
			for(var decomp2Id = 0; decomp2Id < trace.length; decomp2Id++)
			{
				var subsumedTotal = true;
				var decomp2 = trace[decomp2Id];

				if ((decomp2Id == decomp1Id) || (decomp1.length > decomp2.length))
				{
					continue;
				}

				for(var i = 0; i < decomp1.length; i++)
				{
					var section1 = decomp1[i];
					var subsumedSingle = false;
					var start1 = section1[0];
					var end1 = section1[1];
					for(var j = 0; j < decomp2.length; j++)
					{
						var section2 = decomp2[j];
						var start2 = section2[0];
						var end2 = section2[1];
						if((start1 >= start2) && (end1 <= end2))
						{
							//console.log(start1, ",", end1, " =", start2, ",", end2);
							subsumedSingle = true;
							break;
						}
					}
				
					if (subsumedSingle == false)
					{
						subsumedTotal = false;
						break;
					}
				}

				if(subsumedTotal == true)
				{
					eliminated[a][decomp2Id] = 1;
				}
			}
		}

		a++;
	}

	return eliminated;
}

export function atomicSectionsFilter(content, object, fixedTraces, fileNameOrg) 
{
	var lines = content.split("\n");
	var lines2 = fixedTraces.split("\n");
	var count = 0;
	var save = false;
	var dontadd = false;
	var result2 = "{ ";
	var total = "";
	var asDict = {}

	for(var idx = 0; idx < lines.length; idx++)
	{
		var line = lines[idx].trim();
		if(line.includes("EXECUTION"))
		{
			if (result2 != "{ " && !(dontadd))
			{
				asDict[traceId].push(atoms)
			}

			else if(dontadd)
			{
				asDict[traceId].push([])
			}
			result2 = "{ ";
			var traceId = line.substring(line.indexOf("EXECUTION")+9, line.length-14);
			var i = -1;
			asDict[traceId] = [];
			dontadd = false;

			if (object.goodExecutions[traceId - 1] == 0)
			{
				save = true;
			}
			else
			{
				save = false;
			}
		}

		if (save)
		{
			if (line.includes("DECOMPOSITION"))
			{
				i++;
				if (result2 != "{ " && !(dontadd))
				{
					asDict[traceId].push(atoms)
				}

				else if(dontadd)
				{
					asDict[traceId].push([])
				}
				dontadd = false;
				result2 = "{ ";
				var atoms = [];
			}

			else if(line.includes(".java:"))
			{
				count++;
				if (count % 2 == 1)
				{
					var line2 = lines[idx+1].trim();
					var endLine = line.split(" ")[0] + " " + line.split(" ")[1];
					var traceID = line.split(" ")[2];
					var startLine = line2.split(" ")[0] + " " + line2.split(" ")[1];

					var endLineNum = parseInt(line.substring(line.indexOf(".java:")+6, line.length-1), 10);
					var startLineNum = parseInt(line2.substring(line2.indexOf(".java:")+6, line.length-1), 10)

					var atom = [startLineNum, endLineNum];

					if(endLineNum > startLineNum && (endLine.includes(fileNameOrg + ".java:") && startLine.includes(fileNameOrg + ".java:")))
					{
						var stack = [];
						var begin = lines2.indexOf("----------------- TRACE " + traceId + " -----------------");
						var end = lines2.indexOf("----------------- TRACE " + (parseInt(traceId, 10) + 1).toString() + " -----------------");
						for(var line2Id = begin; line2Id < end; line2Id++)
						{
							if(lines2[line2Id][0] == traceID)
							{
								if(lines2[line2Id].includes("invokevirtual"))
								{
									var functList = lines2[line2Id].split(" ")[6].split(".");
									var funct = functList[functList.length-1]
									stack.push(funct);
								}
								else if(lines2[line2Id].includes("return") && lines2[line2Id].includes(stack[stack.length-1]))
								{
									stack.pop();
								}
								else if(lines2[line2Id].includes(startLine))
								{
									var start = stack[stack.length-1];
									//console.log("START: " + start);
								}
								else if(lines2[line2Id].includes(endLine))
								{
									var end = stack[stack.length-1];
									//console.log("END: " + end);
									break;
								}
							}			
						}

						if(start == end)
						{
							result2 += "[" + startLineNum.toString() + ", " + endLineNum.toString() + "] ";
							atoms.push(atom);
						}
						else
						{
							dontadd = true;
						}			
					}
					else
					{
						dontadd = true;
					}
				}
			}
		}
		if (idx == lines.length-1)
		{
			if (result2 != "{ " && !(dontadd))
			{
				asDict[traceId].push(atoms)
			}

			else if(dontadd)
			{
				asDict[traceId].push([])
			}
			dontadd = false;
			result2 = "{ ";
		}
	}

	for(var traceIdx in asDict)
	{
		var trace = asDict[traceIdx];
		var changed = true;

		while(changed)
		{
			changed = false;
			for(var i = 0; i < trace.length; i++)
			{
				var decomp = trace[i];
				if (decomp.length == 0)
				{
					asDict[traceIdx].splice(i, 1);
					changed = true;
					break;
				}
				for(var section1Id = 0; section1Id < decomp.length; section1Id++)
				{
					var section1 = decomp[section1Id];
					var start1 = section1[0];
					var end1 = section1[1];
					for(var section2Id = 0; section2Id < decomp.length; section2Id++)
					{
						if(section1Id == section2Id)
						{
							continue;
						}
						var section2 = decomp[section2Id];
						var start2 = section2[0];
						var end2 = section2[1];
						if ((end2 >= start1 && start1 >= start2) || (end2 >= end1 && end1 >= start2))
						{
							decomp.splice(1, 1);
							decomp.splice(0, 1);
							var array = [start1, start2, end1, end2];
							decomp.push([Math.min(...array), Math.max(...array)])
							trace[i] = decomp;
							asDict[traceIdx] = trace;
							changed = true;
							break;		
						}
					}
					if (changed)
					{
						break;
					}
				}
				if (changed)
				{
					break;
				}
			}
		}

		//console.log("--------------")
		var trace2 = [];
		for(var i = 0; i < trace.length; i++)
		{
			var elem = trace[i];
			var add = true;
			for(var j = 0; j < trace2.length; j++)
			{
				if (this.arraysOfArraysEqual(trace[i], trace2[j]))
				{
					add = false;
					break
				}
			}
			if(add)
			{
				trace2.push(elem);
			}
		}
		asDict[traceIdx] = trace2
	}

	var result = "";

	for(var traceIdx in asDict)
	{
		var trace = asDict[traceIdx];
		if(trace.length > 0)
		{
			result += "TRACE " + traceIdx.toString() + ")\n";
			for(var decompId = 0; decompId < trace.length; decompId++)
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
				result += " ]\n";
			}
		}
	}

	const fs = require('fs')
	var path2 = require('path');
	var filename = process.cwd();
	var curDic = path2.dirname(path2.dirname(process.mainModule.filename));
	fs.writeFile(curDic + '/Outputs/AtomicSectionsOrganized.txt', result.trim(), (err) => 
	{      
	    // In case of a error throw err. 
	    if (err) throw err; 
	})
	//console.log(result);
	return asDict;
}



