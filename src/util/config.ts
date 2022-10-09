import path from 'node:path';
import micromatch from 'micromatch';
import type { ImportedConfiguration, Configuration, IssueType } from '../types';

export const importConfig = (cwd: string, configArg: string) => {
  try {
    const manifest = require(path.join(cwd, 'package.json'));
    if ('knip' in manifest) return manifest.knip;
    else throw new Error('Unable to find `knip` key in package.json');
  } catch (error) {
    try {
      return require(path.resolve(configArg));
    } catch (error) {
      console.error(`Unable to find configuration at ${path.join(cwd, configArg)}\n`);
    }
  }
};

export const resolveConfig = (importedConfiguration: ImportedConfiguration, cwdArg?: string) => {
  if (cwdArg && !('projectFiles' in importedConfiguration)) {
    const importedConfigKey = Object.keys(importedConfiguration).find(pattern => micromatch.isMatch(cwdArg, pattern));
    if (importedConfigKey) {
      return importedConfiguration[importedConfigKey];
    }
  }
  if (!cwdArg && (!importedConfiguration.entryFiles || !importedConfiguration.projectFiles)) {
    console.error('Unable to find `entryFiles` and/or `projectFiles` in configuration.');
    console.info('Add it at root level, or use the --cwd argument with a matching configuration.\n');
    return;
  }
  return importedConfiguration as Configuration;
};

export const resolveIncludedFromArgs = (onlyArg: string[], excludeArg: string[]) => {
  const groups: IssueType[] = ['files', 'exports', 'types', 'nsExports', 'nsTypes', 'duplicates'];
  const only = onlyArg.map(value => value.split(',')).flat() as IssueType[];
  const exclude = excludeArg.map(value => value.split(',')).flat() as IssueType[];
  const includes = (only.length > 0 ? only : groups).filter((group: IssueType) => !exclude.includes(group));
  return groups.reduce((r, group) => ((r[group] = includes.includes(group)), r), {} as Configuration['include']);
};
