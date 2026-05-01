const fs = require('fs');
const path = require('path');

class LearningEngine {
  constructor() {
    this.dataPath = path.join(__dirname, '../../reports/historical_data.json');
    this._ensureDataFile();
  }

  _ensureDataFile() {
    if (!fs.existsSync(this.dataPath)) {
      fs.mkdirSync(path.dirname(this.dataPath), { recursive: true });
      fs.writeFileSync(this.dataPath, JSON.stringify({ executionHistory: [] }, null, 2));
    }
  }

  getHistory() {
    return JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
  }

  recordExecution(testId, status, duration, failureReason) {
    const data = this.getHistory();
    data.executionHistory.push({
      testId,
      status,
      duration,
      failureReason,
      timestamp: new Date().toISOString()
    });
    fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2));
  }

  getFlakyTests() {
    const history = this.getHistory().executionHistory;
    const stats = {};
    history.forEach(record => {
      if (!stats[record.testId]) {
        stats[record.testId] = { passes: 0, fails: 0 };
      }
      if (record.status === 'PASS') stats[record.testId].passes++;
      if (record.status === 'FAIL') stats[record.testId].fails++;
    });

    return Object.keys(stats).filter(id => stats[id].fails > 0 && stats[id].passes > 0);
  }

  getFailingPatterns() {
    // Basic pattern analysis based on historical failures
    const history = this.getHistory().executionHistory;
    const failed = history.filter(h => h.status === 'FAIL');
    // Return most recent failure reasons
    return failed.map(f => f.failureReason).filter(Boolean);
  }
}

module.exports = new LearningEngine();
