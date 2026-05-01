const express = require('express');
const config = require('./config');
const testGenerator = require('./generator/TestGenerator');
const executionPlanner = require('./planner/ExecutionPlanner');
const testExecutor = require('./executor/TestExecutor');
const resultEngine = require('./analyzer/ResultEngine');
const failureAnalyzer = require('./analyzer/FailureAnalyzer');
const jiraService = require('./jira/JiraService');
const reporter = require('./reporter/Reporter');

const app = express();
app.use(express.json());

app.post('/api/trigger', async (req, res) => {
  try {
    const { feature, priority, acceptanceCriteria } = req.body;

    if (!feature || !priority || !acceptanceCriteria) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    console.log(`[1/8] Triggering QA execution for feature: ${feature}`);

    // Module 2: AI Test Generator
    console.log('[2/8] Generating AI tests...');
    const generatedTests = await testGenerator.generateTests(req.body);

    // Module 3: Execution Planner
    console.log('[3/8] Planning execution...');
    const testPlan = executionPlanner.planExecution(generatedTests);

    // Module 4: Test Execution
    console.log('[4/8] Executing tests...');
    await testExecutor.executeTests(testPlan);

    // Module 5: Result Engine
    console.log('[5/8] Processing results...');
    const results = resultEngine.processResults();

    // Module 6 & 7: AI Failure Analysis & Jira Integration
    console.log('[6/8] Analyzing failures and logging bugs...');
    for (const result of results) {
      if (result.status === 'FAIL') {
        const analysis = await failureAnalyzer.analyzeFailure(result.title, result.failureReason);
        result.aiAnalysis = analysis;

        const jiraResult = await jiraService.createBug(result, analysis);
        if (jiraResult && jiraResult.key) {
          result.jiraKey = jiraResult.key;
        }
      }
    }

    // Module 8: Reporting
    console.log('[8/8] Generating reports...');
    const metrics = reporter.generateReports(results);

    res.json({
      message: 'QA Execution completed',
      metrics,
      reportUrl: '/reports/dashboard.html'
    });

  } catch (error) {
    console.error('Execution failed:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

// Serve reports statically
app.use('/reports', express.static(`${config.WORKSPACE_DIR}/reports`));

app.listen(config.PORT, () => {
  console.log(`AI QA Platform Server running on port ${config.PORT}`);
});
