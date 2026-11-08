import { OpenAiCompatibleSttProvider } from './openai-compatible-stt.provider.js';

export class GroqSttProvider extends OpenAiCompatibleSttProvider {
  readonly name = 'Groq Whisper';
  protected readonly endpoint = 'https://api.groq.com/openai/v1/audio/transcriptions';

  constructor(apiKey: string, model = 'whisper-large-v3') {
    super(apiKey, model);
  }
}
