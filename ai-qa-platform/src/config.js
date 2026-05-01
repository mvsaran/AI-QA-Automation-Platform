require('dotenv').config();

module.exports = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  JIRA_URL: process.env.JIRA_URL || '',
  JIRA_EMAIL: process.env.JIRA_EMAIL || '',
  JIRA_API_TOKEN: process.env.JIRA_API_TOKEN || '',
  JIRA_PROJECT_KEY: process.env.JIRA_PROJECT_KEY || 'QA',
  PORT: process.env.PORT || 3000,
  WORKSPACE_DIR: process.cwd()
};
