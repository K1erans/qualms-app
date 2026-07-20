import { copyFile, mkdir, rm } from 'node:fs/promises';
import { arch, platform } from 'node:process';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';

const desktopRoot = fileURLToPath(new URL('..', import.meta.url));
const workspaceRoot = fileURLToPath(new URL('../../..', import.meta.url));
const source = fileURLToPath(
  new URL(
    `../../cli/dist/qualms${platform === 'win32' ? '.exe' : ''}`,
    import.meta.url,
  ),
);
const triples = {
  'darwin-arm64': 'aarch64-apple-darwin',
  'darwin-x64': 'x86_64-apple-darwin',
  'win32-x64': 'x86_64-pc-windows-msvc',
};
const key = `${platform}-${arch}`;
const triple = triples[key];

if (!triple) {
  throw new Error(`Unsupported desktop sidecar target: ${key}`);
}

const child = spawn(
  'corepack',
  ['pnpm', '--filter', 'qualms', 'build:sidecar'],
  { cwd: workspaceRoot, stdio: 'inherit' },
);
const [exitCode] = await once(child, 'close');
if (exitCode !== 0) {
  throw new Error(`Sidecar build failed with exit code ${String(exitCode)}`);
}

const binaries = `${desktopRoot}/src-tauri/binaries`;
const extension = platform === 'win32' ? '.exe' : '';
const destination = `${binaries}/qualms-${triple}${extension}`;
await mkdir(binaries, { recursive: true });
await rm(destination, { force: true });
await copyFile(source, destination);
