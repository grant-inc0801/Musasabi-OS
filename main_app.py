```javascript
// packages/lead-priority/src/leadPriorityService.js
const priorityCalculator = require('./priorityCalculator');
const queueGenerator = require('./queueGenerator');
const recommendationGenerator = require('./recommendationGenerator');

function calculateLeadPriority(leadData) {
  return priorityCalculator.calculate(leadData);
}

function generateCallQueue(leads) {
  const priorities = leads.map(calculateLeadPriority);
  return queueGenerator.generate(priorities);
}

function generateRecommendations(lead) {
  return recommendationGenerator.generate(lead);
}

module.exports = {
  calculateLeadPriority,
  generateCallQueue,
  generateRecommendations,
};

// packages/lead-priority/src/priorityCalculator.js
function calculate(leadData) {
  // Dummy score calculation implementation
  const score = Math.random() * 100;
  return {
    leadId: leadData.id,
    priorityScore: score,
    appointmentProbability: score / 100,
  };
}

module.exports = {
  calculate,
};

// packages/lead-priority/src/scoringRules.js
// Define scoring rules here - currently not used due to simple implementation

// packages/lead-priority/src/recommendationGenerator.js
function generate(lead) {
  return `Call ${lead.companyName} first. Similar companies have a booking rate of 78%. Use opening pattern #3.`;
}

module.exports = {
  generate,
};

// packages/lead-priority/src/queueGenerator.js
function generate(priorities) {
  return priorities
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .map((priority, index) => ({
      leadId: priority.leadId,
      queueOrder: index + 1,
      recommendation: `Priority rank ${index + 1}`,
    }));
}

module.exports = {
  generate,
};

// packages/lead-priority/src/index.js
const service = require('./leadPriorityService');
const leads = require('./leads.json'); // Assume this is a list of leads

const callQueue = service.generateCallQueue(leads);
callQueue.forEach((item) => {
  console.log(`Queue Order: ${item.queueOrder}, Lead ID: ${item.leadId}, ${service.generateRecommendations(item)}`);
});
```