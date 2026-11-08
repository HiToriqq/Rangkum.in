export class LlmProviderConfigurationError extends Error {
  readonly status = 503;

  constructor(provider: string) {
    super(`${provider} dipilih tetapi API key belum dikonfigurasi.`);
    this.name = 'LlmProviderConfigurationError';
  }
}

export class LlmProviderUnavailableError extends Error {
  readonly status = 503;

  constructor(message: string) {
    super(message);
    this.name = 'LlmProviderUnavailableError';
  }
}
