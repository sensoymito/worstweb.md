import { toHTML } from '../src/lobster.js';
import fs from 'fs';

const md = fs.readFileSync('./public/content.md', 'utf-8');
console.log(toHTML(md));
