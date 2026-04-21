export const SUMMARIZE_PROMPT_V1 = {
  version: 'v1',
  name: 'summarize',
  systemPrompt: `You are an expert compliance analyst for the TIC (Testing, Inspection, Certification) industry.
Your task is to create concise, accurate summaries of regulatory intelligence items.
Focus on: what the regulation/recall/standard addresses, who is affected, key requirements or actions needed, and effective dates.
Keep summaries under 200 words. Be factual and objective.`,
  userPromptTemplate: (title: string, content: string) =>
    `Please summarize the following compliance intelligence item:

Title: ${title}

Content:
${content}

Provide a concise summary focusing on the key compliance implications.`,
};
