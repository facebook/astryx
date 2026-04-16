import {spawn} from 'child_process';

const themes = ['default', 'neutral', 'brutalist', 'daily', 'whatsapp', 'meta'];

const builds = themes.map(
  (name) =>
    new Promise((resolve, reject) => {
      const proc = spawn(
        'yarn',
        ['workspace', `@xds/theme-${name}`, 'build'],
        {stdio: 'inherit', shell: true},
      );
      proc.on('close', (code) =>
        code === 0
          ? resolve(name)
          : reject(new Error(`theme-${name} build failed (exit ${code})`)),
      );
    }),
);

try {
  await Promise.all(builds);
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
