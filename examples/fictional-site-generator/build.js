// Minimal static site generator.
// content/*.md + site.config.json -> build/*.html
// This script is the only writer of build/. Never hand-edit anything under build/.
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const CONTENT = path.join(ROOT, 'content');
const OUT = path.join(ROOT, 'build');
const CONFIG = path.join(ROOT, 'site.config.json');

function readConfig() {
  return JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
}

function listPages(dir, base = '') {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      out.push(...listPages(full, path.join(base, name)));
    } else if (name.endsWith('.md')) {
      out.push({ rel: path.join(base, name).replace(/\\/g, '/'), full });
    }
  }
  return out;
}

function render(cfg, rel, body) {
  // Rendered values come from site.config.json only, so a config edit survives rebuilds.
  return [
    '<!doctype html>',
    '<html lang="en">',
    `<head><meta charset="utf-8"><title>${cfg.title}</title></head>`,
    '<body>',
    `<header><h1>${cfg.title}</h1><nav>${cfg.nav.map((n) => `<a href="${n.href}">${n.label}</a>`).join(' ')}</nav></header>`,
    `<main data-source="${rel}">\n${body}\n</main>`,
    `<footer>${cfg.footer}</footer>`,
    '</body>',
    '</html>',
    '',
  ].join('\n');
}

function build() {
  const cfg = readConfig();
  const pages = listPages(CONTENT);
  for (const page of pages) {
    const target = path.join(OUT, page.rel.replace(/\.md$/, '.html'));
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, render(cfg, page.rel, fs.readFileSync(page.full, 'utf8')));
    console.log(`wrote ${path.relative(ROOT, target)}`);
  }
}

build();
