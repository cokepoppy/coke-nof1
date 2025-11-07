import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface TradingDecision {
  signal: 'buy_to_enter' | 'sell_to_enter' | 'hold' | 'close';
  coin: string;
  quantity: number;
  leverage: number;
  profit_target: number;
  stop_loss: number;
  invalidation_condition: string;
  justification: string;
  confidence: number;
  risk_usd: number;
}

class OpenRouterService {
  private client: AxiosInstance;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';

    // Configure proxy if set in environment
    const axiosConfig: any = {
      baseURL: 'https://openrouter.ai/api/v1',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
        'X-Title': 'NOF1.AI Trading Arena',
        'Content-Type': 'application/json',
      },
      timeout: 120000, // 2 minutes timeout for reasoning models
    };

    // Add proxy agents if configured
    if (process.env.HTTP_PROXY) {
      axiosConfig.httpAgent = this.createProxyAgent(process.env.HTTP_PROXY);
      axiosConfig.httpsAgent = this.createProxyAgent(process.env.HTTPS_PROXY || process.env.HTTP_PROXY);
    }

    this.client = axios.create(axiosConfig);
  }

  private createProxyAgent(proxyUrl: string) {
    const { HttpsProxyAgent } = require('https-proxy-agent');
    return new HttpsProxyAgent(proxyUrl);
  }

  /**
   * Call a model via OpenRouter
   * @param modelId - The model identifier (e.g., 'openai/gpt-4', 'anthropic/claude-3.5-sonnet')
   * @param messages - Array of messages for the conversation
   * @param options - Additional options like temperature, max_tokens
   */
  async callModel(
    modelId: string,
    messages: OpenRouterMessage[],
    options: {
      temperature?: number;
      max_tokens?: number;
      top_p?: number;
      frequency_penalty?: number;
      presence_penalty?: number;
    } = {}
  ): Promise<OpenRouterResponse> {
    try {
      logger.info(`Calling OpenRouter with model: ${modelId}`);

      const response = await this.client.post<OpenRouterResponse>('/chat/completions', {
        model: modelId,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 4000,
        top_p: options.top_p ?? 1,
        frequency_penalty: options.frequency_penalty ?? 0,
        presence_penalty: options.presence_penalty ?? 0,
      });

      logger.info(`OpenRouter response received. Tokens used: ${response.data.usage.total_tokens}`);
      return response.data;

    } catch (error: any) {
      if (error.response) {
        logger.error(`OpenRouter API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        throw new Error(`OpenRouter API error: ${error.response.data.error?.message || 'Unknown error'}`);
      } else if (error.request) {
        logger.error('No response received from OpenRouter API');
        throw new Error('No response from OpenRouter API');
      } else {
        logger.error(`Error setting up OpenRouter request: ${error.message}`);
        throw error;
      }
    }
  }

  /**
   * Get trading decision from an AI model
   * @param modelId - The model identifier
   * @param systemPrompt - System prompt defining the trading rules
   * @param userPrompt - User prompt with market data
   */
  async getTradingDecision(
    modelId: string,
    systemPrompt: string,
    userPrompt: string
  ): Promise<TradingDecision | null> {
    try {
      const messages: OpenRouterMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ];

      const response = await this.callModel(modelId, messages, {
        temperature: 0.7,
        max_tokens: 4000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        logger.warn('No content in model response');
        return null;
      }

      // Parse the JSON response from the model
      // The model should return a JSON object with trading decision
      const decision = this.parseTradingDecision(content);
      return decision;

    } catch (error: any) {
      logger.error(`Error getting trading decision: ${error.message}`);
      return null;
    }
  }

  /**
   * Parse trading decision from model response
   */
  private parseTradingDecision(content: string): TradingDecision | null {
    try {
      // Try to extract JSON from the response
      // The model might wrap JSON in markdown code blocks or other text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        logger.warn('No JSON found in model response');
        logger.debug(`Model response content: ${content.substring(0, 500)}...`);
        return null;
      }

      const decision = JSON.parse(jsonMatch[0]) as TradingDecision;

      // Log the parsed decision for debugging
      logger.debug(`Parsed decision: ${JSON.stringify(decision)}`);

      // Validate the decision has required fields
      if (!decision.signal) {
        logger.warn('Invalid trading decision format: missing signal');
        logger.debug(`Decision object: ${JSON.stringify(decision)}`);
        return null;
      }

      // For non-hold signals, coin is required
      if (decision.signal !== 'hold' && !decision.coin) {
        logger.warn(`Invalid trading decision format: ${decision.signal} signal requires coin`);
        logger.debug(`Decision object: ${JSON.stringify(decision)}`);
        return null;
      }

      return decision;

    } catch (error: any) {
      logger.error(`Error parsing trading decision: ${error.message}`);
      logger.debug(`Content: ${content.substring(0, 1000)}...`);
      return null;
    }
  }

  /**
   * Get available models from OpenRouter
   */
  async getAvailableModels(): Promise<any[]> {
    try {
      const response = await this.client.get('/models');
      return response.data.data || [];
    } catch (error: any) {
      logger.error(`Error fetching models: ${error.message}`);
      return [];
    }
  }
}

export default new OpenRouterService();
