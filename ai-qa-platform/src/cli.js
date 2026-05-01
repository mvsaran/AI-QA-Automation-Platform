#!/usr/bin/env node

const { program } = require('commander');
const testGenerator = require('./generator/TestGenerator');
const executionPlanner = require('./planner/ExecutionPlanner');
const testExecutor = require('./executor/TestExecutor');
const resultEngine = require('./analyzer/ResultEngine');
const failureAnalyzer = require('./analyzer/FailureAnalyzer');
const jiraService = require('./jira/JiraService');
const reporter = require('./reporter/Reporter');

program
  .version('1.0.0')
  .description('AI QA Platform CLI')
  .requiredOption('-f, --feature <string>', 'Feature description')
  .requiredOption('-p, --priority <string>', 'Priority (high, medium, low)')
  .requiredOption('-a, --acceptance <string>', 'Acceptance criteria (comma separated)')
  .action(async (options) => {
    try {
      const input = {
        feature: options.feature,
        priority: options.priority,
        acceptanceCriteria: options.acceptance.split(',').map(s => s.trim())
      };

      console.log(`\n🚀 [1/8] Starting CLI QA Execution for feature: ${input.feature}`);

      console.log('🤖 [2/8] Generating AI tests...');
      const generatedTests = await testGenerator.generateTests(input);

      console.log('📅 [3/8] Planning execution...');
      const testPlan = executionPlanner.planExecution(generatedTests);

      console.log('⚙️ [4/8] Executing tests...');
      await testExecutor.executeTests(testPlan);

      console.log('📊 [5/8] Processing results...');
      const results = resultEngine.processResults();

      console.log('🔍 [6/7] Analyzing failures and logging bugs...');
      for (const result of results) {
        if (result.status === 'FAIL') {
          console.log(`   Analyzing failure for: ${result.title}`);
          const analysis = await failureAnalyzer.analyzeFailure(result.title, result.failureReason);
          result.aiAnalysis = analysis;

          console.log(`   Logging Jira bug...`);
          const jiraResult = await jiraService.createBug(result, analysis);
          if (jiraResult && jiraResult.key) {
            result.jiraKey = jiraResult.key;
          }
        }
      }

      console.log('📈 [8/8] Generating reports...');
      const metrics = reporter.generateReports(results);

      console.log('\n✅ Execution Completed!');
      console.log(`Passed: ${metrics.passed} | Failed: ${metrics.failed} | Flaky: ${metrics.flaky}`);
      console.log('Dashboard generated at: reports/dashboard.html');

    } catch (error) {
      console.error('❌ CLI Execution failed:', error);
      process.exit(1);
    }
  });

program.parse(process.argv);
