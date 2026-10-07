// Copies MathJax into the public directory, so that the site serves it itself instead of loading it from a CDN.
import { cpSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const modules = join(root, 'node_modules');
const target = join(root, 'frontend', 'public', 'mathjax');

rmSync(target, { recursive: true, force: true });
cpSync(join(modules, 'mathjax'), target, {
  recursive: true,
  filter: (source) => !source.includes(`${join('mathjax', 'node_modules')}`) && !/node-main/.test(source),
});
// only the CHTML output of the default font is used
const font = join(modules, '@mathjax', 'mathjax-newcm-font');
const fontTarget = join(target, 'fonts', 'mathjax-newcm-font');
cpSync(join(font, 'chtml.js'), join(fontTarget, 'chtml.js'));
cpSync(join(font, 'chtml'), join(fontTarget, 'chtml'), { recursive: true });
