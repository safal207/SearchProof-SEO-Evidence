import test from 'node:test';
import assert from 'node:assert/strict';
import { isPrivateIp, validatePublicTarget } from '../src/remote-target.mjs';

test('private and loopback IP ranges are rejected', () => {
  for (const address of ['127.0.0.1', '10.0.0.2', '172.16.0.1', '192.168.1.1', '169.254.169.254', '100.64.0.1', '::1', 'fd00::1', 'fe80::1']) {
    assert.equal(isPrivateIp(address), true, address);
  }
  assert.equal(isPrivateIp('8.8.8.8'), false);
  assert.equal(isPrivateIp('2606:4700:4700::1111'), false);
});

test('public URL is normalized after public DNS resolution', async () => {
  const lookup = async () => [{ address: '203.0.113.10', family: 4 }];
  assert.equal(await validatePublicTarget('https://example.com/path#fragment', lookup), 'https://example.com/path');
});

test('hostnames resolving to private addresses are rejected', async () => {
  const lookup = async () => [{ address: '10.0.0.5', family: 4 }];
  await assert.rejects(() => validatePublicTarget('https://example.com', lookup), /private, loopback or link-local/i);
});

test('localhost and unsupported protocols are rejected', async () => {
  await assert.rejects(() => validatePublicTarget('http://localhost:8080'), /local targets/i);
  await assert.rejects(() => validatePublicTarget('file:///etc/passwd'), /http\(s\)/i);
});
