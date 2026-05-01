const { OpenAI } = require('openai');
const config = require('../config');

class FailureAnalyzer {
  constructor() {
    this.openai = new OpenAI({
      apiKey: config.OPENAI_API_KEY
    });
  }

  async analyzeFailure(testTitle, errorLog, logs = '') {
    const prompt = `
      Act as a Senior SDET. Analyze the following automated test failure.
      
      Test Title: ${testTitle}
      Error Log: ${errorLog}
      Execution Logs: ${logs}

      Provide a structured JSON response with your analysis:
      {
        "rootCause": "Detailed explanation of why it failed based on the error and logs",
        "severity": "Critical|High|Medium|Low",
        "fixSuggestion": "Specific, actionable step to fix the code or test. Do not return 'none'.",
        "defectType": "ProductBug|EnvironmentIssue|TestDataIssue|FlakyTest",
        "isRealBug": true/false
      }
      Note: Set 'isRealBug' to true if 'defectType' is 'ProductBug'. If the failure is a functional mismatch or unexpected behavior in the application UI, classify it as a 'ProductBug'.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error analyzing failure:', error);
      return {
        rootCause: 'Failed to analyze via AI',
        severity: 'Medium',
        fixSuggestion: 'Manual investigation required',
        defectType: 'ProductBug',
        isRealBug: true
      };
    }
  }
}

module.exports = new FailureAnalyzer();
