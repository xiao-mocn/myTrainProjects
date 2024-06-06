import fs from 'fs-extra'
import yaml from 'yaml'
import { type ProjectSnapshot, type ResolvedDependencies} from '@pnpm/lockfile-file'
import { PackageInfo } from '../utils/type'


const parseInternalDeps = (depDef: ProjectSnapshot) => {
  const { dependencies, devDependencies } = depDef;
  return {
    ...dependencies,
    ...devDependencies
  }
};

const parseFromSpecify = (specifier: string) => {
  const REGEXP = /\/(?<name>[^@]+)@(?<version>[^@/]+)/g;
  const match = REGEXP.exec(specifier);
  if (!match || !match.groups) {
    throw new Error(`Cannot parse this key: ${specifier}`);
  }
  const { name, version } = match.groups;

  return {
    name,
    specifier,
    version,
  };
};
export const getPnpmDependencies = async (filePath: string) => {
  const fileContents = await fs.readFile(filePath, 'utf8');
  const data = yaml.parse(fileContents);
  const { importers, packages, dependencies, devDependencies, } = data;
  let deps: Record<string, PackageInfo> = {};
  if (importers) {
    const modules = Object.keys(importers).map(key => ({
      dependencies: parseInternalDeps(importers[key]),
      name: key,
    }));
    modules.forEach(module => {
      deps[module.name] = module
    })
  }
  // debugger
  if (packages) {
    Object.keys(packages).map(key => {
      try {
        if (!key) return;
        const { name, version } = parseFromSpecify(key);
        deps[name] = {
          name,
          version,
          dependencies: parseInternalDeps(packages[key]),
        }
      } catch (e) {
        console.log(e)
      }
    })
  }
  return deps;
}