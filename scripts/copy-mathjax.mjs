// Copies MathJax into the public directory, so that the site serves it itself instead of loading it from a CDN.
import { cpSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const target = join(root, 'frontend', 'public', 'mathjax');

// resolve the packages as Node.js does, so that the font is the version MathJax depends on, also when npm installs
// it under node_modules/mathjax/node_modules because another package depends on a different version
const packageDir = (from, name) => dirname(createRequire(from).resolve(`${name}/package.json`));
const mathjax = packageDir(import.meta.url, 'mathjax');
const font = packageDir(join(mathjax, 'package.json'), '@mathjax/mathjax-newcm-font');

rmSync(target, { recursive: true, force: true });
cpSync(mathjax, target, {
  recursive: true,
  filter: (source) => !source.includes(`${join('mathjax', 'node_modules')}`) && !/node-main/.test(source),
});
// only the CHTML output of the default font is used
const fontTarget = join(target, 'fonts', 'mathjax-newcm-font');
cpSync(join(font, 'chtml.js'), join(fontTarget, 'chtml.js'));
cpSync(join(font, 'chtml'), join(fontTarget, 'chtml'), { recursive: true });
