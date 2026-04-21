import { SUMMARIZE_PROMPT_V1 } from './v1/summarize';
import { TAGGING_PROMPT_V1 } from './v1/tagging';
import { RISK_ASSESSMENT_PROMPT_V1 } from './v1/risk-assessment';

export { SUMMARIZE_PROMPT_V1 } from './v1/summarize';
export { TAGGING_PROMPT_V1 } from './v1/tagging';
export { RISK_ASSESSMENT_PROMPT_V1 } from './v1/risk-assessment';

export const PROMPT_REGISTRY = {
  v1: {
    summarize: SUMMARIZE_PROMPT_V1,
    tagging: TAGGING_PROMPT_V1,
    riskAssessment: RISK_ASSESSMENT_PROMPT_V1,
  },
} as const;

export type PromptVersion = keyof typeof PROMPT_REGISTRY;
