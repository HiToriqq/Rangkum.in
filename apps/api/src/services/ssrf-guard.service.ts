import dns from 'dns';
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { env } from '../config/env.js';

export class SsrfError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SsrfError';
  }
}

/**
 * Check if an IPv4 or IPv6 string is private, loopback, or metadata address
 */
export function isPrivateOrReservedIp(ip: string): boolean {
  // Normalize IPv4-mapped IPv6
  let cleanIp = ip.toLowerCase();
  if (cleanIp.startsWith('::ffff:')) {
    cleanIp = cleanIp.slice(7);
  }

  // IPv4 Checks
  if (cleanIp.includes('.')) {
    const parts = cleanIp.split('.').map((p) => parseInt(p, 10));
    if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
      return true; // invalid = treat as restricted
    }

    const [b0, b1] = parts;

    // 0.0.0.0/8 (Current network)
    if (b0 === 0) return true;
    // 127.0.0.0/8 (Loopback)
    if (b0 === 127) return true;
    // 10.0.0.0/8 (Private)
    if (b0 === 10) return true;
    // 172.16.0.0/12 (Private: 172.16.0.0 - 172.31.255.255)
    if (b0 === 172 && b1 >= 16 && b1 <= 31) return true;
    // 192.168.0.0/16 (Private)
    if (b0 === 192 && b1 === 168) return true;
    // 169.254.0.0/16 (Link-local & AWS/GCP/Azure Metadata 169.254.169.254)
    if (b0 === 169 && b1 === 254) return true;
    // 100.64.0.0/10 (Carrier-grade NAT)
    if (b0 === 100 && b1 >= 64 && b1 <= 127) return true;
    // 224.0.0.0/4 (Multicast)
    if (b0 >= 224) return true;

    return false;
  }

  // IPv6 Checks
  if (cleanIp === '::1' || cleanIp === '::') return true; // Loopback & Unspecified
  if (cleanIp.startsWith('fc') || cleanIp.startsWith('fd')) return true; // Unique local (fc00::/7)
  if (cleanIp.startsWith('fe80:')) return true; // Link-local
  if (cleanIp.startsWith('ff')) return true; // Multicast

  return false;
}

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe('SSRF Guard Service', () => {
    it('blocks loopback IP addresses (127.0.0.0/8, ::1)', () => {
      expect(isPrivateOrReservedIp('127.0.0.1')).toBe(true);
      expect(isPrivateOrReservedIp('127.255.255.255')).toBe(true);
      expect(isPrivateOrReservedIp('::1')).toBe(true);
      expect(isPrivateOrReservedIp('::ffff:127.0.0.1')).toBe(true);
    });

    it('blocks private IP addresses', () => {
      expect(isPrivateOrReservedIp('10.0.0.1')).toBe(true);
      expect(isPrivateOrReservedIp('10.255.0.1')).toBe(true);
      expect(isPrivateOrReservedIp('172.16.0.1')).toBe(true);
      expect(isPrivateOrReservedIp('172.31.255.255')).toBe(true);
      expect(isPrivateOrReservedIp('192.168.1.10')).toBe(true);
      expect(isPrivateOrReservedIp('192.168.0.1')).toBe(true);
    });

    it('blocks cloud metadata and link-local addresses', () => {
      expect(isPrivateOrReservedIp('169.254.169.254')).toBe(true);
      expect(isPrivateOrReservedIp('169.254.1.1')).toBe(true);
      expect(isPrivateOrReservedIp('fe80::1')).toBe(true);
    });

    it('allows public IP addresses', () => {
      expect(isPrivateOrReservedIp('8.8.8.8')).toBe(false);
      expect(isPrivateOrReservedIp('1.1.1.1')).toBe(false);
      expect(isPrivateOrReservedIp('93.184.216.34')).toBe(false);
    });
  });
}

/**
 * Validate URL and download safely with SSRF protection, size limit, and timeout
 */
export async function downloadSafeAudioUrl(
  urlStr: string,
  destFolder = env.TEMP_DIR,
  maxRedirects = 3
): Promise<string> {
  let currentUrl = urlStr.trim();
  let redirectsRemaining = maxRedirects;

  const maxSizeBytes = env.MAX_UPLOAD_SIZE_MB * 1024 * 1024;
  const timeoutMs = 25000; // 25s timeout

  while (redirectsRemaining >= 0) {
    let parsed: URL;
    try {
      parsed = new URL(currentUrl);
    } catch {
      throw new SsrfError('Format URL tidak valid.');
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new SsrfError('Hanya skema http: dan https: yang diizinkan.');
    }

    if (parsed.username || parsed.password) {
      throw new SsrfError('URL tidak boleh menyertakan kredensial otentikasi.');
    }

    // Resolve DNS and check all IPs
    const addresses = await dns.promises.lookup(parsed.hostname, { all: true });
    if (!addresses || addresses.length === 0) {
      throw new SsrfError(`Hostname tidak dapat diselesaikan: ${parsed.hostname}`);
    }

    for (const addr of addresses) {
      if (isPrivateOrReservedIp(addr.address)) {
        throw new SsrfError(`Akses ke alamat IP privat/terlarang diblokir: ${addr.address}`);
      }
    }

    // Prepare temp file path
    const randomSuffix = crypto.randomBytes(8).toString('hex');
    const tempFilePath = path.join(destFolder, `rangkum_url_${Date.now()}_${randomSuffix}.tmp`);

    const result = await new Promise<{ isRedirect: boolean; redirectUrl?: string; filePath?: string }>(
      (resolve, reject) => {
        const client = parsed.protocol === 'https:' ? https : http;

        const req = client.get(
          currentUrl,
          {
            timeout: timeoutMs,
            headers: {
              'User-Agent': 'RangkuminAudioBot/1.0',
            },
          },
          (res) => {
            // Handle redirects
            if (
              res.statusCode &&
              [301, 302, 303, 307, 308].includes(res.statusCode) &&
              res.headers.location
            ) {
              res.resume(); // discard response
              const nextUrl = new URL(res.headers.location, currentUrl).href;
              return resolve({ isRedirect: true, redirectUrl: nextUrl });
            }

            if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
              res.resume();
              return reject(new Error(`Server merespons dengan status error: ${res.statusCode}`));
            }

            const contentType = res.headers['content-type']?.toLowerCase() || '';
            const contentLength = parseInt(res.headers['content-length'] || '0', 10);

            if (contentLength > maxSizeBytes) {
              res.resume();
              return reject(new Error(`Ukuran file melebihi batas maksimum ${env.MAX_UPLOAD_SIZE_MB} MB.`));
            }

            // Stream to file and count bytes
            const fileStream = fs.createWriteStream(tempFilePath);
            let downloadedBytes = 0;

            res.on('data', (chunk) => {
              downloadedBytes += chunk.length;
              if (downloadedBytes > maxSizeBytes) {
                req.destroy();
                fileStream.close();
                fs.unlink(tempFilePath, () => {});
                reject(new Error(`Ukuran file unduhan melebihi batas ${env.MAX_UPLOAD_SIZE_MB} MB.`));
              }
            });

            res.pipe(fileStream);

            fileStream.on('finish', () => {
              fileStream.close();
              resolve({ isRedirect: false, filePath: tempFilePath });
            });

            fileStream.on('error', (err) => {
              fs.unlink(tempFilePath, () => {});
              reject(err);
            });
          }
        );

        req.on('timeout', () => {
          req.destroy();
          fs.unlink(tempFilePath, () => {});
          reject(new Error('Koneksi unduhan audio melebihi batas waktu (timeout).'));
        });

        req.on('error', (err) => {
          fs.unlink(tempFilePath, () => {});
          reject(err);
        });
      }
    );

    if (result.isRedirect && result.redirectUrl) {
      currentUrl = result.redirectUrl;
      redirectsRemaining--;
      continue;
    }

    if (result.filePath) {
      return result.filePath;
    }
  }

  throw new SsrfError('Jumlah pengalihan (redirect) melebihi batas maksimum.');
}
