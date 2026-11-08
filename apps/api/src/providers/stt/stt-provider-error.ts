export class SttProviderError extends Error {
  constructor(
    message: string,
    public readonly status = 502
  ) {
    super(message);
    this.name = 'SttProviderError';
  }
}

export class SttProviderConfigurationError extends SttProviderError {
  constructor(provider: string) {
    super(`${provider} dipilih tetapi API key belum dikonfigurasi.`, 503);
    this.name = 'SttProviderConfigurationError';
  }
}
