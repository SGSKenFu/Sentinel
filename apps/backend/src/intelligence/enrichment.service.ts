import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { IntelligenceItemEntity } from './entities/intelligence-item.entity';
import { ProcessingChainEntry, RiskLevel } from '@sentinel/types';
import {
  SUMMARIZE_PROMPT_V1,
  TAGGING_PROMPT_V1,
  RISK_ASSESSMENT_PROMPT_V1,
} from '@sentinel/prompts';

interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LlmChoice {
  message: { content: string };
}

interface LlmResponse {
  choices: LlmChoice[];
}

@Injectable()
export class EnrichmentService {
  private readonly logger = new Logger(EnrichmentService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly model: string;
  private readonly maxTokens: number;
  private readonly temperature: number;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = configService.get<string>('LLM_BASE_URL', 'https://api.openai.com/v1');
    this.apiKey = configService.get<string>('LLM_API_KEY', '');
    this.model = configService.get<string>('LLM_MODEL', 'gpt-4o-mini');
    this.maxTokens = configService.get<number>('LLM_MAX_TOKENS', 1024);
    this.temperature = configService.get<number>('LLM_TEMPERATURE', 0.2);
  }

  async enrich(item: Partial<IntelligenceItemEntity>): Promise<Partial<IntelligenceItemEntity>> {
    const chain = [...(item.processingChain ?? [])];

    if (!this.apiKey) {
      chain.push({
        stage: 'enrichment',
        timestamp: new Date().toISOString(),
        status: 'skipped',
        details: 'LLM API key not configured',
      });
      return { ...item, processingChain: chain };
    }

    const title = item.title ?? '';
    const rawContent = item.summary ?? '';

    try {
      const summary = await this.callLlm([
        { role: 'system', content: SUMMARIZE_PROMPT_V1.systemPrompt },
        { role: 'user', content: SUMMARIZE_PROMPT_V1.userPromptTemplate(title, rawContent) },
      ]);

      const tagsRaw = await this.callLlm([
        { role: 'system', content: TAGGING_PROMPT_V1.systemPrompt },
        { role: 'user', content: TAGGING_PROMPT_V1.userPromptTemplate(title, summary) },
      ]);

      let tags: string[] = item.tags ?? [];
      try {
        const parsed = JSON.parse(tagsRaw) as unknown;
        if (Array.isArray(parsed)) {
          tags = (parsed as unknown[]).filter((t): t is string => typeof t === 'string');
        }
      } catch {
        this.logger.warn('Failed to parse tags JSON, using keyword-extracted tags');
      }

      const riskRaw = await this.callLlm([
        { role: 'system', content: RISK_ASSESSMENT_PROMPT_V1.systemPrompt },
        {
          role: 'user',
          content: RISK_ASSESSMENT_PROMPT_V1.userPromptTemplate(
            title,
            summary,
            item.sourceType ?? '',
          ),
        },
      ]);

      let riskLevel: RiskLevel = item.riskLevel ?? RiskLevel.INFO;
      try {
        const riskParsed = JSON.parse(riskRaw) as { riskLevel?: string };
        if (riskParsed.riskLevel && Object.values(RiskLevel).includes(riskParsed.riskLevel as RiskLevel)) {
          riskLevel = riskParsed.riskLevel as RiskLevel;
        }
      } catch {
        this.logger.warn('Failed to parse risk assessment JSON');
      }

      const enrichEntry: ProcessingChainEntry = {
        stage: 'enrichment',
        timestamp: new Date().toISOString(),
        status: 'success',
        details: `LLM model: ${this.model}`,
      };

      return {
        ...item,
        summary,
        tags,
        riskLevel,
        enrichedAt: new Date(),
        llmVersion: `${SUMMARIZE_PROMPT_V1.version}/${this.model}`,
        processingChain: [...chain, enrichEntry],
      };
    } catch (err) {
      const errorEntry: ProcessingChainEntry = {
        stage: 'enrichment',
        timestamp: new Date().toISOString(),
        status: 'error',
        details: err instanceof Error ? err.message : 'Unknown enrichment error',
      };
      this.logger.error('Enrichment failed', err instanceof Error ? err.stack : err);
      return { ...item, processingChain: [...chain, errorEntry] };
    }
  }

  private async callLlm(messages: LlmMessage[]): Promise<string> {
    const response = await axios.post<LlmResponse>(
      `${this.baseUrl}/chat/completions`,
      {
        model: this.model,
        messages,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      },
    );

    return response.data.choices[0]?.message?.content?.trim() ?? '';
  }
}
