const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const config = require('../config');

class JiraService {
  constructor() {
    this.client = axios.create({
      baseURL: config.JIRA_URL,
      headers: {
        'Authorization': `Basic ${Buffer.from(`${config.JIRA_EMAIL}:${config.JIRA_API_TOKEN}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async checkExistingBug(testId) {
    if (!config.JIRA_URL || !config.JIRA_API_TOKEN) return null;
    
    // Search for bugs with the exact summary that are not yet Done/Closed
    const jql = `project = ${config.JIRA_PROJECT_KEY} AND summary ~ "\\"[Automated Bug] Test Failure: ${testId}\\"" AND statusCategory != Done`;
    
    try {
      const response = await this.client.get(`/rest/api/3/search/jql?jql=${encodeURIComponent(jql)}&maxResults=1&fields=key`);
      if (response.data && response.data.issues && response.data.issues.length > 0) {
        return response.data.issues[0].key;
      }
      return null;
    } catch (error) {
      console.error('Failed to search for existing Jira bug:', error.response ? error.response.data : error.message);
      return null;
    }
  }

  async createBug(testResult, aiAnalysis) {
    if (!config.JIRA_URL || !config.JIRA_API_TOKEN) {
      console.warn('Jira credentials missing. Skipping bug creation.');
      return null;
    }

    const existingKey = await this.checkExistingBug(testResult.testId);
    if (existingKey) {
      console.log(`Defect already created with details: ${existingKey}`);
      return { key: existingKey, duplicate: true };
    }

    let description = `
      *Test Failed:* ${testResult.title}
      
      *Error Reason:*
      {code}
      ${testResult.failureReason}
      {code}
    `;

    if (testResult.logs) {
      description += `
      *Execution Logs:*
      {code}
      ${testResult.logs}
      {code}
      `;
    }

    description += `
      *AI Analysis:*
      - *Root Cause:* ${aiAnalysis.rootCause}
      - *Severity:* ${aiAnalysis.severity}
      - *Fix Suggestion:* ${aiAnalysis.fixSuggestion}
    `;

    const payload = {
      fields: {
        project: {
          key: config.JIRA_PROJECT_KEY
        },
        summary: `[Automated Bug] Test Failure: ${testResult.testId}`,
        description: description,
        issuetype: {
          name: 'Bug'
        }
      }
    };

    try {
      const response = await this.client.post('/rest/api/2/issue', payload);
      console.log(`Successfully created Jira bug: ${response.data.key}`);

      if (testResult.screenshotPath && fs.existsSync(testResult.screenshotPath)) {
        console.log(`Attaching screenshot to Jira bug: ${response.data.key}...`);
        await this.attachFile(response.data.key, testResult.screenshotPath);
      }

      return { key: response.data.key, duplicate: false };
    } catch (error) {
      console.error('Failed to create Jira bug:', error.response ? error.response.data : error.message);
      return null;
    }
  }

  async attachFile(issueKey, filePath) {
    if (!config.JIRA_URL || !config.JIRA_API_TOKEN) return null;

    try {
      const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(config.WORKSPACE_DIR, filePath);
      
      if (!fs.existsSync(absolutePath)) {
        console.error(`File does not exist at path: ${absolutePath}`);
        return null;
      }

      console.log(`Preparing to attach file: ${absolutePath} to issue: ${issueKey}`);

      const formData = new FormData();
      const fileStream = fs.createReadStream(absolutePath);
      const fileName = path.basename(absolutePath);
      
      formData.append('file', fileStream, {
        filename: fileName,
        contentType: 'image/png' // Explicitly set content type for screenshots
      });

      const response = await axios.post(`${config.JIRA_URL}/rest/api/2/issue/${issueKey}/attachments`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Basic ${Buffer.from(`${config.JIRA_EMAIL}:${config.JIRA_API_TOKEN}`).toString('base64')}`,
          'X-Atlassian-Token': 'no-check'
        }
      });
      
      console.log(`Successfully attached ${fileName} to ${issueKey}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to attach file to ${issueKey}:`, error.response ? error.response.data : error.message);
      return null;
    }
  }
}

module.exports = new JiraService();
