import test from 'node:test';
import assert from 'node:assert/strict';
import { extractPageSignals } from '../src/crawler.mjs';

test('keeps apostrophes inside double-quoted meta and link attributes', () => {
  const html = `<!doctype html><html><head>
    <title>Roby's Coffee House Menu</title>
    <meta name="description" content="Roby's Coffee House Gazipaşa menu and desserts.">
    <link rel="canonical" href="https://example.test/roby's-menu.html">
  </head><body><h1>Roby's Menu</h1><a href="/roby's-story.html">Story</a></body></html>`;

  const signals = extractPageSignals(html, 'https://example.test/menu.html');

  assert.equal(signals.description, "Roby's Coffee House Gazipaşa menu and desserts.");
  assert.equal(signals.canonical, "https://example.test/roby's-menu.html");
  assert.deepEqual(signals.internalLinks, ["https://example.test/roby's-story.html"]);
});

test('keeps double quotes inside single-quoted attribute values', () => {
  const html = `<!doctype html><html><head>
    <title>Quoted</title>
    <meta name='description' content='A "quoted" description stays intact.'>
    <link rel='canonical' href='https://example.test/quoted.html'>
  </head><body><h1>Quoted</h1></body></html>`;

  const signals = extractPageSignals(html, 'https://example.test/quoted.html');

  assert.equal(signals.description, 'A "quoted" description stays intact.');
  assert.equal(signals.canonical, 'https://example.test/quoted.html');
});
