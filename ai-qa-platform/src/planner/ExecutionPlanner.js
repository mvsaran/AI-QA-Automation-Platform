const learningEngine = require('../learning/LearningEngine');

class ExecutionPlanner {
  planExecution(tests) {
    const flakyTests = learningEngine.getFlakyTests();
    const plannedTests = tests.map(test => {
      let tags = [];
      let score = 0;

      // Tagging based on priority and type
      if (test.priority === 'high' && test.type === 'functional') {
        tags.push('smoke');
        score += 50;
      } else {
        tags.push('regression');
      }

      if (test.priority === 'high') score += 30;
      if (test.priority === 'medium') score += 15;

      // Adjust score if historically flaky
      if (flakyTests.includes(test.id)) {
        score += 20; // High risk, needs to be run early to check stability
        tags.push('flaky-risk');
      }

      return {
        ...test,
        tags,
        executionScore: score
      };
    });

    // Sort by execution score descending
    return plannedTests.sort((a, b) => b.executionScore - a.executionScore);
  }
}

module.exports = new ExecutionPlanner();
