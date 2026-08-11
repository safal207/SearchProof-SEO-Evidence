import dns from 'node:dns/promises';
import net from 'node:net';

export function isPrivateIp(address) {
  if (net.isIP(address) === 4) {
    const parts = address.split('.').map(Number);
    const [a, b] = parts;
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224
    );
  }

  if (net.isIP(address) === 6) {
    const value = address.toLowerCase();
    return value === '::' || value === '::1' || value.startsWith('fc') || value.startsWith('fd') || /^fe[89ab]/.test(value);
  }

  return true;
}

export async function validatePublicTarget(input, lookup = dns.lookup) {
  let url;
  try {
    url = new URL(input);
  } catch {
    throw new Error('Target must be an absolute URL.');
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Only http(s) targets are allowed.');
  }

  const hostname = url.hostname.toLowerCase();
  if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local')) {
    throw new Error('Local targets are not allowed.');
  }

  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) throw new Error('Private, loopback or link-local targets are not allowed.');
  } else {
    const resolved = await lookup(hostname, { all: true, verbatim: true });
    if (!resolved.length) throw new Error('Target hostname did not resolve.');
    if (resolved.some((entry) => isPrivateIp(entry.address))) {
      throw new Error('Target resolves to a private, loopback or link-local address.');
    }
  }

  url.hash = '';
  return url.href;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const input = process.argv[2];
  if (!input) {
    console.error('Usage: node src/remote-target.mjs https://example.com');
    process.exit(1);
  }

  try {
    const target = await validatePublicTarget(input);
    console.log(target);
    if (process.env.GITHUB_OUTPUT) {
      const fs = await import('node:fs/promises');
      await fs.appendFile(process.env.GITHUB_OUTPUT, `target=${target}\n`, 'utf8');
    }
  } catch (error) {
    console.error(`Remote audit target rejected: ${error.message}`);
    process.exit(2);
  }
}
