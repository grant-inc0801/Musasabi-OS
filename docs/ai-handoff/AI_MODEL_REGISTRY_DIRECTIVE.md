# AI Model Registry Directive

## Purpose
Implement AI Model Registry inside AI Integration Center.

Musasabi OS must manage all AI models in one place and support model selection, routing, approval, audit and cost management.

## Registry Dashboard
Show the model list with:
- Model Name
- Provider
- Version
- Status
- Department
- AI Employee
- Strengths
- Average Speed
- Estimated Cost
- Context Length
- Evaluation Score
- Last Updated
- Approval Status

## Initial Providers
- OpenAI
- Anthropic
- Google
- Microsoft
- Meta
- Mistral
- xAI
- Ollama
- LM Studio
- Future providers

Provider additions should be plugin-friendly.

## Model Capability Scores
Evaluate each model with numeric scores:
- Reasoning
- Coding
- Japanese
- English
- Long Context
- Summarization
- Research
- Image Understanding
- Image Generation
- Voice Support
- API Stability
- Response Speed
- Cost Efficiency
- Internal Recommendation

## AI Routing Integration
Musasabi OS should recommend models by task type:
- Coding
- UI Design
- Long Summary
- Market Research
- Translation
- Image Generation
- Voice Processing
- Business Planning

Always show the recommended model and reason.

## Model Comparison
Allow side-by-side model comparison:
- Cost
- Speed
- Accuracy
- Context Length
- Success Rate
- Failure Rate
- Recommended Use

## AI Upgrade Manager Integration
When a new model becomes available, create a mock evaluation:
- Capability difference
- Cost difference
- Risk notes
- Recommended adoption status
- Approval request to AI CEO

## Company Brain Integration
Store usage knowledge:
- Strong tasks
- Weak tasks
- Success cases
- Failure cases
- Recommended usage patterns

## AI Secretary Integration
Notify about:
- New model availability
- Recommended model change
- API incident
- Deprecated model
- Cost increase
- Usage limit warning

## Secret Center Integration
AI Model Registry must not store API keys.
Secrets are referenced only by logical names and injected at runtime through AI Secret Center.
Never display or log secret values.

## Production Rule
Mock phase:
- Dummy models
- Dummy scores
- No external connections

Production Readiness phase:
- Real API connections through AI Integration Center
- Runtime secrets through AI Secret Center
- Approval gates before production use

## Completion Criteria
- AI Model Registry mock UI is available.
- Model comparison is available.
- AI Routing recommendations are available.
- AI Upgrade Manager mock evaluation is available.
- Company Brain stores model usage knowledge.
- AI Secretary receives model notifications.
- Secret Center integration rules are respected.
- Tests, README and CLAUDE_RESPONSE.md are updated in Japanese.
