import { OpenAiCompatibleSttProvider } from './openai-compatible-stt.provider.js';

export class OpenAiSttProvider extends OpenAiCompatibleSttProvider {
  readonly name = 'OpenAI Whisper';
  protected readonly endpoint = 'https://api.openai.com/v1/audio/transcriptions';

  constructor(apiKey: string, model = 'whisper-1') {
    super(apiKey, model);
  }
}
