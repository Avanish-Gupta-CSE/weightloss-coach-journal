import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dashboardRoot = path.resolve(__dirname, '..');
const distDir = path.resolve(dashboardRoot, 'dist');
const ghPagesRoot = path.resolve(dashboardRoot, '..');

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function deploy() {
  if (!(await pathExists(distDir))) {
    throw new Error(`dist/ not found at ${distDir}. Run "npm run build" first.`);
  }

  const targetsToReplace = [
    path.join(ghPagesRoot, 'assets'),
    path.join(ghPagesRoot, 'index.html'),
    path.join(ghPagesRoot, 'favicon.svg'),
    path.join(ghPagesRoot, 'icons.svg'),
  ];

  await Promise.all(targetsToReplace.map(p => fs.rm(p, { recursive: true, force: true })));

  const entries = await fs.readdir(distDir, { withFileTypes: true });
  await Promise.all(entries.map(async (entry) => {
    const src = path.join(distDir, entry.name);
    const dest = path.join(ghPagesRoot, entry.name);
    await fs.cp(src, dest, { recursive: true, force: true });
  }));

  console.log(`Deployed dashboard build output to: ${ghPagesRoot}`);
}

deploy().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

