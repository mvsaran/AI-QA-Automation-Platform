const { OpenAI } = require('openai');
const config = require('../config');

class TestGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: config.OPENAI_API_KEY
    });
  }

  async generateTests(input) {
    const { feature, priority, acceptanceCriteria } = input;

    const prompt = `
      Act as a Senior SDET. Generate comprehensive API and UI test cases for the following feature.
      Feature: ${feature}
      Priority: ${priority}
      Acceptance Criteria: ${acceptanceCriteria.join(', ')}

      Requirements:
      - Include Functional, Negative, and Edge cases.
      - Return ONLY valid JSON structured as follows:
      {
        "tests": [
          {
            "id": "T1",
            "title": "...",
            "type": "functional|negative|edge",
            "priority": "high|medium|low",
            "steps": ["..."],
            "expectedResult": "..."
          }
        ]
      }
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });

      const parsed = JSON.parse(response.choices[0].message.content);
      return parsed.tests;
    } catch (error) {
      console.error('Error generating tests:', error);
      throw error;
    }
  }
}

module.exports = new TestGenerator();
