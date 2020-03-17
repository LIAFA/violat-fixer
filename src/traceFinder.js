export function findPaths(content, outcomesSet) 
{
	var stack = [];
	var lines = content.split("\n");
	var prevDepth = 0;
	var startState = "0";
	var result = "";
	var i = 0;

	while (i < lines.length)
	{
		var line = lines[i];
		if(line.includes("-----------------------------------"))
		{
			var currentDepth = parseInt(line.substring(line.indexOf("[")+1, line.indexOf("]")), 10);
			if (currentDepth > prevDepth)
			{
				if (line.includes("visited"))
				{
					var currentState = line.substring(line.indexOf(":")+2, line.indexOf("visited")-1);
				}
				else if (line.includes("new"))
				{
					var currentState = line.substring(line.indexOf(":")+2, line.indexOf("new")-1);
				}
				else
				{
					var currentState = line.substring(line.indexOf(":")+2, line.length);
				}
				stack.push(currentState);
			}
			else if (currentDepth < prevDepth)
			{
				stack.pop();
			}
			prevDepth = currentDepth;
		}

		for(var k = 0; k < outcomesSet.length; k++)
		{
			var outcome = outcomesSet[k];
			if(line.includes(outcome))
			{
				for(var j = i+1; j < lines.length; j++)
				{
					var line2 = lines[j];
					if(line2.includes("-----------------------------------"))
					{
						var currentDepth = parseInt(line2.substring(line2.indexOf("[")+1, line2.indexOf("]")), 10);
						if (currentDepth > prevDepth)
						{
							if (line2.includes("visited"))
							{
								var currentState = line2.substring(line2.indexOf(":")+2, line2.indexOf("visited")-1);
							}
							else if (line2.includes("new"))
							{
								var currentState = line2.substring(line2.indexOf(":")+2, line2.indexOf("new")-1);
							}
							else
							{
								var currentState = line2.substring(line2.indexOf(":")+2, line2.length);
							}
							stack.push(currentState);
							result += outcome + "\n";
							result += "[";
							for(var l = 0; l < stack.length -1; l++)
							{
								result += stack[l].toString() + ", "
							}
							result += stack[stack.length-1].toString() + "]\n";
							i = j;
							prevDepth = currentDepth;
							break
						}
					}
				}
			}
		}

		i++;
	}

	const fs = require('fs');
	var path2 = require('path');
	var filename = process.cwd();
	var curDic = path2.dirname(path2.dirname(process.mainModule.filename));
	fs.writeFile(curDic + '/Outputs/OutputsJPFPaths.txt', result.trim(), (err) => 
	{      
	    // In case of a error throw err. 
	    if (err) throw err; 
	});

	//console.log(result.trim());
	return result.trim();
}

export function findTraces(content, paths, outputs, outcomesSet) 
{
	var pathList = [];
	for(var i = 0; i < paths.length; i++)
	{
		var path = paths[i];
		var num = "";
		var subList = [];
		for(var j = 0; j < path.length; j++)
		{
			var char = path[j];
			if('0' <= char && '9' >= char)
			{
				//console.log(char);
				num += char;
			}
			else
			{
				if(num != "")
				{
					subList.push(parseInt(num, 10));
					num = "";
				}
			}
		}
		pathList.push(subList);
	}

	var lines = content.split("\n");
	var transitionDict = {};

	for(var i = 0; i < pathList.length; i++)
	{
		var path = pathList[i];
		for(var j = 0; j < path.length; j++)
		{
			if (!(path[j] in transitionDict))
			{
				var searchedLine = "----------------------------------- [" + (j+1).toString() + "] forward: " + path[j].toString() + " new";
				for(var k = 0; k < lines.length; k++)
				{
					if (lines[k].includes(searchedLine))
					{
						var endLineIndex = k;
						break
					}
				}

				transitionDict[path[j]] = lines[endLineIndex] + "\n";
				if(j == 0)
				{
					continue;
				}
				else
				{
					var a = 0
					while (!(lines[endLineIndex-1-a].includes("-----------------------------------")))
					{
						transitionDict[path[j]] = lines[endLineIndex-1-a] + "\n" + transitionDict[path[j]];
						a++;
					}
				}
			}
			else
			{
				continue;
			}
		}
	}

	var traces = "";
	for(var i = 0; i < pathList.length; i++)
	{
		var path = pathList[i];
		traces += "----------------- TRACE " + (i+1).toString() + " -----------------\n"
		for(var j = 0; j < path.length; j++)
		{
			if(j == path.length-1 && i > 0)
			{
				for(var k = 0; k < outcomesSet.length; k++)
				{
					var outcome = outcomesSet[k];
					if (transitionDict[path[j]].includes(outcome))
					{
						transitionDict[path[j]] = transitionDict[path[j]].substring(0,transitionDict[path[j]].indexOf(outcome)) + outputs[i].trim() + transitionDict[path[j]].substring(transitionDict[path[j]].indexOf(outcome) + outcome.length, transitionDict[path[j]].length);
					}
				}
			}

			traces += transitionDict[path[j]];
		}
	}

	//console.log(traces);
	const fs = require('fs');
	var path2 = require('path');
	var filename = process.cwd();
	var curDic = path2.dirname(path2.dirname(process.mainModule.filename));
	fs.writeFile(curDic + '/Outputs/OutputsfilteredTraces.txt', traces, (err) => 
	{      
	    // In case of a error throw err. 
	    if (err) throw err; 
	});

	return traces;
}






