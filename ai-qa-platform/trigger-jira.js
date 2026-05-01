const resultEngine = require('./src/analyzer/ResultEngine');
const failureAnalyzer = require('./src/analyzer/FailureAnalyzer');
const jiraService = require('./src/jira/JiraService');
const reporter = require('./src/reporter/Reporter');

async function run() {
  console.log('📊 Processing results...');
  const results = resultEngine.processResults();

  console.log('🔍 Analyzing failures and logging bugs...');
  for (const result of results) {
    if (result.status === 'FAIL') {
      console.log(`   Analyzing failure for: ${result.title}`);
      const analysis = await failureAnalyzer.analyzeFailure(result.title, result.failureReason);
      result.aiAnalysis = analysis;

      if (analysis.isRealBug) {
        console.log(`   Logging Jira bug...`);
        const jiraResult = await jiraService.createBug(result, analysis);
        if (jiraResult && jiraResult.key) {
          result.jiraKey = jiraResult.key;
        }
      } else {
        console.log(`   Skipping Jira bug creation. Reason: ${analysis.defectType} - ${analysis.rootCause}`);
        result.jiraKey = `Skipped (${analysis.defectType})`;
      }
    }
  }

  console.log('📈 Generating reports...');
  const metrics = reporter.generateReports(results);
  console.log('Done!');
}

run().catch(console.error);
