import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { arch, platform } from 'node:process';

const operatingSystems = {
  darwin: 'macos',
  linux: 'linux',
  win32: 'win',
};
const architectures = {
  arm64: 'arm64',
  x64: 'x64',
};
const operatingSystem = operatingSystems[platform];
const architecture = architectures[arch];

if (!operatingSystem || !architecture) {
  throw new Error(`Unsupported sidecar build host: ${platform}-${arch}`);
}

const extension = platform === 'win32' ? '.exe' : '';
const target = `node22-${operatingSystem}-${architecture}`;
const child = spawn(
  'pkg',
  [
    'dist/sidecar.cjs',
    '--target',
    target,
    '--output',
    `dist/qualms${extension}`,
  ],
  { stdio: 'inherit' },
);
const [exitCode] = await once(child, 'close');

if (exitCode !== 0) {
  throw new Error(
    `Sidecar packaging failed with exit code ${String(exitCode)}`,
  );
}
