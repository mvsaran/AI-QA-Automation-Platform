<div align="center">

# 🤖 AI QA Automation Platform

**Autonomous, production-grade QA infrastructure — zero manual test authoring required.**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Playwright](https://img.shields.io/badge/Playwright-Latest-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com)
[![Jira](https://img.shields.io/badge/Jira-Integrated-0052CC?style=for-the-badge&logo=jira&logoColor=white)](https://atlassian.com/jira)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

[Overview](#-overview) • [Quick Start](#-quick-start) • [Setup](#-installation--setup) • [Usage](#-running-the-platform) • [Architecture](#-architecture) • [Benefits](#-why-this-approach) • [Troubleshooting](#-troubleshooting)

</div>

---

## 📌 Overview

The AI QA Platform is a **fully autonomous testing pipeline** that takes a plain-English feature description as input and delivers parallel Playwright test execution, AI-powered failure analysis, and automatic Jira bug filing — without any manual QA scripting.

```
Feature Description + Acceptance Criteria
          ↓
    AI Test Generation (GPT-4)
          ↓
  Risk-Based Test Planning
          ↓
  Parallel Playwright Execution
          ↓
  AI Failure Root Cause Analysis
          ↓
    Auto Jira Bug Filing
          ↓
  HTML Dashboard + JSON Metrics
```

### ✨ What makes it different?

| Traditional QA Automation | AI QA Platform |
|--------------------------|----------------|
| Engineers manually write every test | GPT-4 generates tests from acceptance criteria |
| Tests go stale as features evolve | Tests are regenerated fresh every run |
| Failures produce raw stack traces | AI provides root cause analysis + fix suggestions |
| QA files bugs manually | Jira bugs auto-created with full context |
| No learning between runs | Learning Engine improves prioritization over time |

---

## ⚡ Quick Start

> **Prerequisites:** Node.js v18+, OpenAI API key, Jira Cloud account

```bash
# 1. Clone and install
git clone https://github.com/your-org/ai-qa-platform.git
cd ai-qa-platform
npm install && npx playwright install

# 2. Configure environment
cp .env.template .env
# → Edit .env with your API keys (see Configuration section)

# 3. Run your first test pipeline
node src/cli.js \
  --feature "User Login" \
  --priority "high" \
  --acceptance "Valid credentials login, invalid email rejection, lockout after 3 attempts"

# 4. View results
open reports/dashboard.html
```

---

## 📁 Project Structure

```
ai-qa-platform/
├── src/
│   ├── generator/        # AI Test Generation — calls GPT-4 to produce test scenarios
│   ├── planner/          # Risk scoring, smoke/regression tagging, priority ordering
│   ├── executor/         # Creates .spec.js files & runs Playwright in parallel
│   ├── analyzer/         # Parses results, AI failure analysis & fix suggestions
│   ├── jira/             # Duplicate detection & autonomous bug creation
│   ├── reporter/         # HTML dashboard generation & JSON metrics
│   ├── learning/         # Historical pattern storage for adaptive prioritization
│   ├── index.js          # Express REST API entry point
│   ├── cli.js            # CLI entry point (full end-to-end pipeline)
│   └── config.js         # Centralised environment configuration
├── tests/                # Auto-generated Playwright .spec.js files (gitignore this)
├── reports/              # Execution results, dashboard.html, metrics.json
├── playwright.config.js
└── package.json
```

---

## 🔧 Installation & Setup

### Step 1 — Install Dependencies

```bash
# Install Node.js packages
npm install

# Install Playwright browsers (Chromium, Firefox, WebKit)
npx playwright install
```

### Step 2 — Configure Environment

Create a `.env` file in the project root:

```env
# ── AI Engine ─────────────────────────────
OPENAI_API_KEY=sk-...your-openai-key...

# ── Jira Integration ──────────────────────
JIRA_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your_email@company.com
JIRA_API_TOKEN=your_atlassian_api_token
JIRA_PROJECT_KEY=QA

# ── REST API Server ───────────────────────
PORT=3000
```

> 🔐 **Security:** Add `.env` to your `.gitignore`. Never commit API keys.
>
> 💡 **Jira Token:** Log in to Atlassian → Account Settings → Security → API Tokens → Create token. Grant *Create Issue* and *Read Issue* permissions on your target project.

### Step 3 — Validate Setup

```bash
# Verify Node.js version (must be v18+)
node --version

# Confirm Playwright browsers are installed
npx playwright --version

# Smoke-test your API keys are loading
node -e "require('dotenv').config(); console.log(process.env.OPENAI_API_KEY ? '✅ OpenAI: OK' : '❌ OpenAI: MISSING')"
```

---

## 🚀 Running the Platform

### Option A — CLI (Recommended · Full Pipeline)

Runs the complete AI pipeline in one command: generate → plan → execute → analyze → report.

```bash
node src/cli.js \
  --feature "User Authentication" \
  --priority "high" \
  --acceptance "Valid credentials redirect to dashboard, invalid email shows error, account locks after 3 failed attempts, password reset email sent within 60s"
```

**CLI Flags:**

| Flag | Required | Description |
|------|----------|-------------|
| `--feature` | ✅ Yes | Plain-English feature name (e.g., `"Shopping Cart"`) |
| `--priority` | ✅ Yes | `high` \| `medium` \| `low` — affects test ordering and Jira severity |
| `--acceptance` | ✅ Yes | Comma-separated acceptance criteria. More detail = better AI output. |

---

### Option B — Direct Playwright Execution

If tests have already been generated by the CLI and exist in `tests/`, run them directly:

```bash
# Run all generated tests in parallel (headless)
npx playwright test

# Interactive UI mode for debugging (shows browser)
npx playwright test --ui

# Filter to smoke tests only
npx playwright test --grep @smoke

# Run a specific spec file
npx playwright test tests/user-login.spec.js

# View the interactive Playwright HTML report
npx playwright show-report
```

---

### Option C — REST API (CI/CD & Webhooks)

Start the Express server and trigger runs programmatically — ideal for GitHub Actions, Jenkins, or GitLab CI.

```bash
# Start the server
npm start
# or: node src/index.js
```

```bash
# Trigger a full pipeline run via HTTP POST
curl -X POST http://localhost:3000/api/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "feature": "User Login",
    "priority": "high",
    "acceptanceCriteria": [
      "Valid credentials redirect to dashboard",
      "Invalid email shows error message",
      "Account locks after 3 failed attempts"
    ]
  }'
```

---

### Viewing Results

After any execution method, results are available at:

| Output | Location |
|--------|----------|
| 📊 HTML Dashboard | `reports/dashboard.html` — open in any browser |
| 🎭 Playwright Report | `npx playwright show-report` — interactive trace viewer |
| 📈 JSON Metrics | `reports/metrics.json` — for trend analysis |

---

## 🏗️ Architecture

The platform runs a 9-stage autonomous pipeline on every execution:

```
┌─────────────────────────────────────────────────────────────────┐
│                        PIPELINE STAGES                          │
├────┬──────────────────┬──────────────────────────────────────────┤
│ 1  │ Trigger          │ CLI or REST API receives feature + criteria│
│ 2  │ AI Generator     │ GPT-4 produces functional, negative, edge  │
│    │                  │ case & boundary tests as JSON              │
│ 3  │ Planner          │ Scores risk using Learning Engine history; │
│    │                  │ tags @smoke / @regression; sorts by risk   │
│ 4  │ Executor         │ Creates .spec.js files; runs in parallel   │
│    │                  │ across Chromium, Firefox, WebKit           │
│ 5  │ Result Engine    │ Parses Playwright report → PASS/FAIL/FLAKY │
│    │                  │ Captures errors, stack traces, screenshots │
│ 6  │ Failure Analyzer │ AI root cause analysis; pre-validates to   │
│    │                  │ filter env noise from genuine bugs         │
│ 7  │ Jira Integration │ Checks for duplicates; auto-creates ticket │
│    │                  │ with AI analysis + steps to reproduce      │
│ 8  │ Reporting        │ Renders HTML dashboard; saves metrics.json │
│ 9  │ Learning Engine  │ Persists outcomes → improves next run's    │
│    │                  │ test prioritization automatically          │
└────┴──────────────────┴──────────────────────────────────────────┘
```

### Tech Stack

| Technology | Role | Why |
|------------|------|-----|
| **Node.js** | Orchestrator & CLI | Non-blocking I/O; async pipelines; rich CLI ecosystem |
| **Playwright** | Test execution | Cross-browser parallelism, trace capture, rich HTML reports |
| **OpenAI GPT-4** | AI brain | State-of-the-art reasoning for test generation & failure analysis |
| **Jira API** | Bug tracking | Industry-standard traceability from failure → resolved ticket |
| **Express.js** | REST API | Lightweight HTTP layer for CI/CD and webhook integration |

---

## 🆕 Onboarding a New Project

The platform is project-agnostic. Onboarding a new application takes under **30 minutes**.

### Checklist

#### 1. Environment
- [ ] Fork/clone the repository into your project's infrastructure
- [ ] Copy `.env.template` → `.env` and populate all required keys
- [ ] Run `npm install && npx playwright install`

#### 2. Playwright Configuration

Open `playwright.config.js` and update:

```js
// playwright.config.js
module.exports = {
  use: {
    baseURL: 'https://staging.your-app.com',  // ← your app URL
    screenshot: 'on-first-retry',
    trace: 'on-first-retry',
  },
  retries: 2,        // Recommended for CI
  workers: 4,        // Adjust for your CI runner capacity
  reporter: [['html'], ['json', { outputFile: 'reports/results.json' }]],
};
```

#### 3. Jira Configuration
- [ ] Confirm `JIRA_PROJECT_KEY` matches your project's key (visible in the Jira URL)
- [ ] Ensure API token has *Create Issue* + *Read Issue* permissions
- [ ] Optional: Edit `src/jira/index.js` to customise issue type, labels, or custom fields

#### 4. First Run

```bash
# Start with a high-value, well-defined feature to validate the full pipeline
node src/cli.js \
  --feature "User Login" \
  --priority "high" \
  --acceptance "Valid login redirects to dashboard, invalid credentials show error"
```

- Review generated tests in `tests/` to calibrate AI output quality
- Verify `reports/dashboard.html` and check that a Jira ticket was created for any failures

#### 5. CI/CD Integration

**GitHub Actions example:**

```yaml
# .github/workflows/qa.yml
name: AI QA Pipeline

on: [push, pull_request]

jobs:
  qa:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm install && npx playwright install --with-deps
      - name: Run AI QA Pipeline
        run: |
          node src/cli.js \
            --feature "${{ github.event.head_commit.message }}" \
            --priority "high" \
            --acceptance "${{ vars.ACCEPTANCE_CRITERIA }}"
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          JIRA_URL: ${{ secrets.JIRA_URL }}
          JIRA_EMAIL: ${{ secrets.JIRA_EMAIL }}
          JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}
          JIRA_PROJECT_KEY: ${{ vars.JIRA_PROJECT_KEY }}
      - name: Upload reports
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: qa-reports
          path: reports/
```

> 💡 **Multi-team tip:** Run one platform instance per product domain (Auth, Checkout, Profile) with separate `JIRA_PROJECT_KEY` values per domain to keep reporting clean.

---

## 🎯 Why This Approach?

### ⚡ 10× Faster Test Authoring
AI generates a comprehensive test suite from acceptance criteria in seconds. What takes a QA engineer 2–3 hours to author manually takes the platform under 30 seconds.

### 🧠 Zero Maintenance Overhead
Tests are regenerated on each run from the source-of-truth acceptance criteria, eliminating the brittle, stale-test problem that plagues traditional automation frameworks.

### 🔍 Intelligent Failure Analysis — Not Just Red/Green
The AI pre-validator filters environmental noise (network timeouts, CI flakiness) from genuine bugs. Engineers receive root cause analysis and fix suggestions, not raw stack traces.

### 📊 Built-in Risk Management
The Learning Engine tracks historical flakiness per test. The Planner uses this to ensure critical-path tests always run first, even as your test suite grows to hundreds of cases.

### 📋 Automated Traceability
Every genuine failure produces a structured, context-rich Jira ticket automatically — with AI analysis, steps to reproduce, and screenshot evidence — without any manual bug-filing effort.

### 🔄 Continuous Self-Improvement
The platform gets smarter with every run. Historical outcomes feed back into the Planner, improving prioritization accuracy over time with no configuration required.

### 🔧 Extensible by Design
Built on standard Node.js with clean module boundaries. Swap OpenAI for another LLM, Jira for GitHub Issues, or Playwright for Cypress with changes isolated to a single module.

### 🛡️ Signal Over Noise
Duplicate detection in Jira prevents alert fatigue. The AI pre-validation gate means only confirmed, unique bugs generate notifications — keeping your team focused.

---

## 🛠️ Troubleshooting

| Symptom | Resolution |
|---------|------------|
| `SyntaxError` in generated `.spec.js` | AI produced unescaped characters. Platform sanitises with `JSON.stringify` — ensure you're on the latest `src/generator/index.js`. |
| Jira bug not created for a failure | Check `JIRA_PROJECT_KEY` and token permissions. The AI pre-validator may have classified the failure as environmental — check CLI logs for "Failure Analyzer" output. |
| No tests generated | Verify `OPENAI_API_KEY` is valid with available credits. Ensure `--acceptance` criteria are descriptive enough for GPT-4 to derive concrete test actions. |
| Playwright browsers not found | Run `npx playwright install`. In Docker/CI, use the official `mcr.microsoft.com/playwright` image or add `npx playwright install --with-deps` to your setup step. |
| Tests pass locally, fail in CI | Confirm `baseURL` in `playwright.config.js` resolves from the CI network. Override with `PLAYWRIGHT_BASE_URL` env variable without changing code. |
| Reports not generated | Ensure `reports/` directory is writable. Check CLI exit code for a fatal pipeline error — look for `[ERROR]` lines in stdout. |

---

## 📄 License

MIT © your-org

---

<div align="center">

**AI QA Platform** — Autonomous Quality. Intelligent Insights. Zero Manual Effort.

</div>
