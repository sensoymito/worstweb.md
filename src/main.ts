import { loadMarkdown } from './lobster.js';
import { startgame } from "./game.js"

async function init() {
  await loadMarkdown('./content.md', document.getElementById('content')!);
  startgame()
}

init();
