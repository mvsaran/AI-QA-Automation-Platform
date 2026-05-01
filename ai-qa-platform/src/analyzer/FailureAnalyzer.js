const { OpenAI } = require('openai');
const config = require('../config');

class FailureAnalyzer {
  constructor() {
    this.openai = new OpenAI({
      apiKey: config.OPENAI_API_KEY
    });
  }

  async analyzeFailure(testTitle, errorLog) {
    const prompt = `
      Act as a Senior SDET. Analyze the following automated test failure.
      
      Test Title: ${testTitle}
      Error Log: ${errorLog}

      Provide a structured JSON response with your analysis:
      {
        "rootCause": "Short explanation of why it failed",
        "severity": "Critical|High|Medium|Low",
        "fixSuggestion": "Actionable step to fix the code or test",
        "defectType": "ProductBug|EnvironmentIssue|TestDataIssue|FlakyTest",
        "isRealBug": true/false
      }
      Note: Set 'isRealBug' to true ONLY if 'defectType' is 'ProductBug'. If it is an Environment Issue, Test Data Issue, or Flaky Test, set it to false.
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
