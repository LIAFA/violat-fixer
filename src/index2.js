import * as jpf from './JPF';
import * as filter from './filter'
import * as traceFinder from './traceFinder'
import * as testCycles from './CycleFinder/TestCycles'

var object = {
	numOfThreads: 0,
	goodExecutions: []
}

const path = '/Users/berkcirisci/repos/jpf-core/src/examples/synchrobench/jpf';
const fileName = 'RWLockCoarseGrainedListIntSetTest1';
const fileNameOrg = 'RWLockCoarseGrainedListIntSet';
const filteredString = ['java.util.concurrent.locks']
const atomicOutcomes = ['true, false, true'];

var execOutput = jpf.ExecTracker(fileName, path);
var Outcomes = jpf.Outcomes(fileName, path);

var outcomesSet = Outcomes.split('\n');
outcomesSet = outcomesSet.filter((a, b) => outcomesSet.indexOf(a) === b);
outcomesSet = outcomesSet.filter(Boolean);

var filtered = filter.outputFilter(execOutput, object, filteredString, outcomesSet);
var pathsAndOutcomes = traceFinder.findPaths(filtered, outcomesSet);
var pathsAndOutcomesList = pathsAndOutcomes.split("\n");
var paths = [];
var outputs = [];
for(var i = 0; i < pathsAndOutcomesList.length; i++)
{
	if(i % 2 == 0)
	{
		outputs.push(pathsAndOutcomesList[i]);
	}
	else
	{
		paths.push(pathsAndOutcomesList[i]);
	}
}

var traces = traceFinder.findTraces(filtered, paths, outputs, outcomesSet);
var graphInfo = testCycles.generateCycles(traces, object, atomicOutcomes);
var atomicSections = testCycles.runCycleFinderGE(graphInfo, object, outputs);
var asDict = filter.atomicSectionsFilter(atomicSections, object, traces, fileNameOrg);
var eliminated = filter.subsume(asDict);
var results = testCycles.runCycleFinderBE(eliminated, asDict, graphInfo, object);