export function ExecTracker(fileName, path) 
{
	var child_process = require('child_process');
	const fs = require('fs')
	var path2 = require('path');
	var jpfpath = "/Users/berkcirisci/repos/jpf-core/bin"
	// exec: spawns a shell.
	var content = child_process.execSync('java -jar /Users/berkcirisci/repos/jpf-core/build/RunJPF.jar +report.console.property_violation= +listener=gov.nasa.jpf.listener.ExecTracker +classpath=' + path + ' ' + fileName, {maxBuffer:Infinity, cwd:jpfpath}).toString();
	var filename = process.cwd();
	var curDic = path2.dirname(path2.dirname(process.mainModule.filename));
	fs.mkdir(curDic + '/Outputs', { recursive: true }, (err) => 
	{
  		if (err) throw err;
	});

	fs.writeFile(curDic + '/Outputs/ExecTracker.txt', content, (err) => 
	{      
	    // In case of a error throw err. 
	    if (err) throw err; 
	})

	return content;
}

export function Outcomes(fileName, path) 
{
	var path2 = require('path');
	var jpfpath = "/Users/berkcirisci/repos/jpf-core/bin"
	var child_process = require('child_process');
	const fs = require('fs')
	// exec: spawns a shell.
	var content = child_process.execSync('java -jar /Users/berkcirisci/repos/jpf-core/build/RunJPF.jar +report.console.property_violation= +classpath=' + path + ' ' + fileName, {maxBuffer:Infinity, cwd:jpfpath}).toString();
	var contentList = content.split("======================================================")
	content = contentList[2]
	content = content.substring(content.search('\n')+1, content.length);
	var filename = process.cwd();
	var curDic = path2.dirname(path2.dirname(process.mainModule.filename));
	fs.writeFile(curDic + '/Outputs/Outcomes.txt', content, (err) => 
	{      
	    // In case of a error throw err. 
	    if (err) throw err; 
	})

	return content;
}
