import { execSync } from 'child_process';
import { existsSync, rmSync, cpSync } from 'fs';
import { resolve } from 'path';

const sweeperDir = resolve('sweeper');
const publicDir = resolve('public', 'sweeper');

console.log('Installing sweeper dependencies...');
execSync('npm install', { cwd: sweeperDir, stdio: 'inherit' });

console.log('Building sweeper...');
execSync('npm run build', { cwd: sweeperDir, stdio: 'inherit' });

console.log('Copying sweeper dist to public/sweeper...');
if (existsSync(publicDir)) {
  rmSync(publicDir, { recursive: true, force: true });
}
cpSync(resolve(sweeperDir, 'dist'), publicDir, { recursive: true });

console.log('Sweeper build done.');
