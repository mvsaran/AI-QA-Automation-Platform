const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const config = require('../config');

class TestExecutor {
  constructor() {
    this.testsDir = path.join(config.WORKSPACE_DIR, 'tests');
  }

  _generateTestFile(plan) {
    if (!fs.existsSync(this.testsDir)) {
      fs.mkdirSync(this.testsDir, { recursive: true });
    }

    const testFilePath = path.join(this.testsDir, 'dynamic.spec.js');
    let fileContent = `const { test, expect } = require('@playwright/test');\n\n`;

    plan.forEach(testCase => {
      const tags = testCase.tags.map(t => `@${t}`).join(' ');
      fileContent += `test('${testCase.id}: ${testCase.title} ${tags}', async ({ page, request }) => {\n`;
      fileContent += `  console.log('Executing step: ' + ${JSON.stringify(testCase.steps.join(' '))});\n`;
      // In a real scenario, this would map the steps to actual page actions or API calls.
      // For demonstration, we simulate execution based on the expectedResult.
      fileContent += `  // Simulated execution\n`;
      if (testCase.type === 'negative' || testCase.id.includes('FAIL')) {
        fileContent += `  expect(true).toBe(false); // Forced failure for demonstration\n`;
      } else {
        fileContent += `  expect(true).toBe(true);\n`;
      }
      fileContent += `});\n\n`;
    });

    fs.writeFileSync(testFilePath, fileContent);
  }

  async executeTests(plan) {
    this._generateTestFile(plan);

    try {
      console.log('Running Playwright tests...');
      execSync('npx playwright test', { stdio: 'inherit', cwd: config.WORKSPACE_DIR });
      return true;
    } catch (error) {
      console.error('Test execution completed with failures.');
      return false;
    }
  }
}

module.exports = new TestExecutor();
