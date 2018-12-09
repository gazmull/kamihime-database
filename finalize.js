const fs = require('fs-extra');
const { resolve } = require('path');
const { exec } = require('child_process');

const ex = require('util').promisify(exec);
const log = message => console.log('finalize: ' + message);

// -- Uglify TypeScript build
(async () => {
  const command = 'uglifyjs-folder build/proto --config-file uglify.json -ey -x .js -o build';
  const { stderr } = await ex(command);

  if (stderr) throw err;

  log('Uglified build/proto successfully.');
  return true;
})()

// -- Remove TypeScript build
.then(async () => {
  const proto = resolve(__dirname, 'build/proto');

  await fs.remove(proto);

  log('Removed build/proto sucessfully.');
  return true;
})

// -- Copy Views (Pug Files)
.then(async () => {
  const build = resolve(__dirname, 'build/views');
  const src = resolve(__dirname, 'src/views');

  await fs.copy(src, build);

  log('Copied views to build successfully.');
  return true;
})

// -- Exit
.then(() => {
  log('Finalized successfully.')
  process.exit(0);
})
.catch(e => {
  log('Error:', e);
  process.exit(1);
});
