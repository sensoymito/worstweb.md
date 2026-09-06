import { loadMarkdown } from './lobster.js';
import kaplay from 'kaplay';

async function init() {
  await loadMarkdown('./content.md', document.getElementById('content')!);

  const canvas = document.getElementById('game') as HTMLCanvasElement | null;
  if (!canvas) {
    console.error('Game canvas not found');
    return;
  }

  const k = kaplay({
    canvas,
    width: 640,
    height: 480,
    background: [20, 20, 40],
  });

  const player = k.add([
    k.rect(40, 40),
    k.pos(320, 240),
    k.color(0, 255, 128),
    k.anchor('center'),
    {
      speed: 240,
    },
  ]);

  k.onUpdate(() => {
    let dir = k.vec2(0, 0);
    if (k.isKeyDown('left') || k.isKeyDown('a')) dir.x -= 1;
    if (k.isKeyDown('right') || k.isKeyDown('d')) dir.x += 1;
    if (k.isKeyDown('up') || k.isKeyDown('w')) dir.y -= 1;
    if (k.isKeyDown('down') || k.isKeyDown('s')) dir.y += 1;

    const len = dir.len();
    if (len > 0) {
      dir = dir.scale(1 / len);
      player.move(dir.scale(player.speed));
    }

    player.pos.x = k.clamp(player.pos.x, 20, k.width() - 20);
    player.pos.y = k.clamp(player.pos.y, 20, k.height() - 20);
  });
}

init();
