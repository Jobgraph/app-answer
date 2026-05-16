const ANSWERS: Record<string, string> = {
  refund: "Our refund policy allows full refunds within 30 days of purchase. After 30 days, we offer pro-rated refunds for annual subscriptions. To request a refund, contact support with your order number.",
  hours: "Our support team is available Monday to Friday, 9:00 AM to 6:00 PM GMT. For urgent issues outside these hours, use the emergency contact form on the website.",
  pricing: "We offer three tiers:\n\n- **Starter** — £29/month, up to 5 users\n- **Professional** — £79/month, up to 25 users\n- **Enterprise** — Custom pricing, unlimited users\n\nAll plans include a 14-day free trial.",
  integration: "We integrate with **Slack**, **Microsoft Teams**, **Salesforce**, **HubSpot**, and **Jira** out of the box. Custom integrations are available via our REST API and webhooks.",
  security: "We follow industry best practices for security:\n\n- SOC 2 Type II certified\n- Data encrypted at rest (AES-256) and in transit (TLS 1.3)\n- Annual penetration testing by independent auditors\n- GDPR compliant with DPA available on request",
  onboarding: "Getting started is straightforward:\n\n1. **Sign up** for a free trial\n2. **Connect** your data sources via the setup wizard\n3. **Invite** your team members\n4. **Configure** your knowledge base categories\n\nMost teams are up and running within 30 minutes. Our onboarding team is available for a guided walkthrough if needed.",
  default: "I don't have specific information about that in the knowledge base yet. Once connected to your organisation's data sources, I'll be able to provide accurate answers based on your documentation.",
};

export function getMockAnswer(question: string): string {
  const q = question.toLowerCase();
  if (q.includes('refund') || q.includes('money back')) return ANSWERS.refund;
  if (q.includes('hours') || q.includes('available') || q.includes('support')) return ANSWERS.hours;
  if (q.includes('price') || q.includes('pricing') || q.includes('cost') || q.includes('plan')) return ANSWERS.pricing;
  if (q.includes('integrat') || q.includes('connect') || q.includes('slack') || q.includes('api')) return ANSWERS.integration;
  if (q.includes('secur') || q.includes('encrypt') || q.includes('gdpr') || q.includes('soc')) return ANSWERS.security;
  if (q.includes('start') || q.includes('onboard') || q.includes('setup') || q.includes('begin')) return ANSWERS.onboarding;
  return ANSWERS.default;
}

export const SUGGESTED_QUESTIONS = [
  "What is your refund policy?",
  "What integrations do you support?",
  "How much does it cost?",
  "How do I get started?",
  "What are your security certifications?",
  "What are your support hours?",
];
