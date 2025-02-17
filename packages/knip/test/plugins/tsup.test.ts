import assert from 'node:assert/strict';
import test from 'node:test';
import * as tsup from '../../src/plugins/tsup/index.js';
import { resolve, join } from '../../src/util/path.js';
import { getManifest, pluginConfig as config } from '../helpers/index.js';

const cwd = resolve('fixtures/plugins/tsup');
const manifest = getManifest(cwd);

test('Find dependencies in tsup configuration (json)', async () => {
  const configFilePath = join(cwd, 'package.json');
  const dependencies = await tsup.findDependencies(configFilePath, { manifest, config });
  assert.deepEqual(dependencies, []);
});
