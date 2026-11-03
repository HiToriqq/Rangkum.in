import { describe, it, expect } from 'vitest';
import { isPrivateOrReservedIp } from './ssrf-guard.service.js';

describe('SSRF Guard Service', () => {
  it('blocks loopback IP addresses (127.0.0.0/8, ::1)', () => {
    expect(isPrivateOrReservedIp('127.0.0.1')).toBe(true);
    expect(isPrivateOrReservedIp('127.255.255.255')).toBe(true);
    expect(isPrivateOrReservedIp('::1')).toBe(true);
    expect(isPrivateOrReservedIp('::ffff:127.0.0.1')).toBe(true);
  });

  it('blocks private IP addresses (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)', () => {
    expect(isPrivateOrReservedIp('10.0.0.1')).toBe(true);
    expect(isPrivateOrReservedIp('10.255.0.1')).toBe(true);
    expect(isPrivateOrReservedIp('172.16.0.1')).toBe(true);
    expect(isPrivateOrReservedIp('172.31.255.255')).toBe(true);
    expect(isPrivateOrReservedIp('192.168.1.10')).toBe(true);
    expect(isPrivateOrReservedIp('192.168.0.1')).toBe(true);
  });

  it('blocks cloud metadata and link-local addresses (169.254.0.0/16, fe80::)', () => {
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
