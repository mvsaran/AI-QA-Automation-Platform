const fs = require('fs');
const path = require('path');
const config = require('../config');
const learningEngine = require('../learning/LearningEngine');

class ResultEngine {
  constructor() {
    this.reportPath = path.join(config.WORKSPACE_DIR, 'reports/test-results.json');
  }

  processResults() {
    if (!fs.existsSync(this.reportPath)) {
      throw new Error('Test report not found. Did the executor run successfully?');
    }

    const rawData = fs.readFileSync(this.reportPath, 'utf8');
    const results = JSON.parse(rawData);

    const processedResults = [];

    results.suites.forEach(suite => {
      suite.specs.forEach(spec => {
        const testIdMatch = spec.title.match(/^([a-zA-Z0-9_]+):/);
        const testId = testIdMatch ? testIdMatch[1] : 'UNKNOWN';
        
        let status = 'PASS';
        let failureReason = null;
        let duration = 0;

        const testTests = spec.tests[0]; // Assuming one project config
        const testResults = testTests.results;

        // Calculate total duration
        duration = testResults.reduce((acc, curr) => acc + curr.duration, 0);

        // Check if flaky (passed but had retries that failed)
        const passedResults = testResults.filter(r => r.status === 'passed');
        const failedResults = testResults.filter(r => r.status === 'failed' || r.status === 'timedOut');

        let screenshotPath = null;
        let logs = '';

        if (passedResults.length > 0 && failedResults.length > 0) {
          status = 'FLAKY';
        } else if (passedResults.length === 0) {
          status = 'FAIL';
          // Extract failure reason from the last result
          const lastFail = testResults[testResults.length - 1];
          if (lastFail.error && lastFail.error.message) {
            failureReason = lastFail.error.message.split('\n')[0];
          }
          
          if (lastFail.attachments) {
            const screenshotAttachment = lastFail.attachments.find(a => a.name === 'screenshot');
            if (screenshotAttachment) {
              screenshotPath = screenshotAttachment.path;
            }
          }

          if (lastFail.stdout) {
            logs = lastFail.stdout.map(s => s.text).join('');
          }
          if (lastFail.stderr) {
            logs += lastFail.stderr.map(s => s.text).join('');
          }
        }

        const reportEntry = {
          testId,
          title: spec.title,
          status,
          duration,
          failureReason,
          screenshotPath,
          logs
        };

        processedResults.push(reportEntry);
        
        // Record in learning engine
        learningEngine.recordExecution(testId, status, duration, failureReason);
      });
    });

    return processedResults;
  }
}

module.exports = new ResultEngine();
