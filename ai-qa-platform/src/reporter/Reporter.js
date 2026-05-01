const fs = require('fs');
const path = require('path');
const config = require('../config');

class Reporter {
  constructor() {
    this.reportsDir = path.join(config.WORKSPACE_DIR, 'reports');
  }

  generateReports(results) {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }

    const metrics = {
      total: results.length,
      passed: results.filter(r => r.status === 'PASS').length,
      failed: results.filter(r => r.status === 'FAIL').length,
      flaky: results.filter(r => r.status === 'FLAKY').length,
      executionTimeMs: results.reduce((acc, curr) => acc + curr.duration, 0)
    };

    // 1. Save JSON Report
    fs.writeFileSync(
      path.join(this.reportsDir, 'final-report.json'),
      JSON.stringify({ metrics, results }, null, 2)
    );

    // 2. Save Metrics Summary
    fs.writeFileSync(
      path.join(this.reportsDir, 'metrics-summary.json'),
      JSON.stringify(metrics, null, 2)
    );

    // 3. Generate HTML Dashboard
    this._generateHtmlDashboard(metrics, results);

    return metrics;
  }

  _generateHtmlDashboard(metrics, results) {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>AI QA Platform - Test Report</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f7f6; margin: 0; padding: 20px; color: #333; }
        h1 { color: #2c3e50; text-align: center; }
        .metrics-card { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: flex; justify-content: space-around; margin-bottom: 20px; }
        .metric { text-align: center; }
        .metric h3 { margin: 0; font-size: 24px; }
        .metric p { margin: 5px 0 0; color: #7f8c8d; }
        .table-container { background: #fff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #34495e; color: #fff; }
        .PASS { color: #27ae60; font-weight: bold; }
        .FAIL { color: #e74c3c; font-weight: bold; }
        .FLAKY { color: #f39c12; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>AI QA Platform - Test Execution Report</h1>
      <div class="metrics-card">
        <div class="metric"><h3>${metrics.total}</h3><p>Total Tests</p></div>
        <div class="metric"><h3><span class="PASS">${metrics.passed}</span></h3><p>Passed</p></div>
        <div class="metric"><h3><span class="FAIL">${metrics.failed}</span></h3><p>Failed</p></div>
        <div class="metric"><h3><span class="FLAKY">${metrics.flaky}</span></h3><p>Flaky</p></div>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Test ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Duration (ms)</th>
              <th>AI Analysis / Failure Reason</th>
              <th>Jira Bug</th>
            </tr>
          </thead>
          <tbody>
            ${results.map(r => `
              <tr>
                <td>${r.testId}</td>
                <td>${r.title}</td>
                <td class="${r.status}">${r.status}</td>
                <td>${r.duration}</td>
                <td>${r.aiAnalysis ? `[${r.aiAnalysis.defectType || 'N/A'}] ${r.aiAnalysis.rootCause}` : (r.failureReason || 'N/A')}</td>
                <td>${r.jiraKey ? (r.jiraKey.startsWith('Skipped') ? r.jiraKey : `<a href="${config.JIRA_URL}/browse/${r.jiraKey}">${r.jiraKey}</a>`) : 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </body>
    </html>
    `;

    fs.writeFileSync(path.join(this.reportsDir, 'dashboard.html'), htmlContent);
  }
}

module.exports = new Reporter();
