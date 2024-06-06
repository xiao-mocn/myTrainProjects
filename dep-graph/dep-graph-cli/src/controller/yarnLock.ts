import fs from 'fs-extra'
import { parse } from '@yarnpkg/lockfile'
import { PackageInfo } from '../utils/type';

export const getYarnDependencies = async (filePath: string) => {
  const fileContents = await fs.readFile(filePath, 'utf8');
  const packages = parse(fileContents);
  const dependencies: Record<string, PackageInfo> = {};
  Object.keys(packages.object).forEach((key) => {
    const value = packages.object[key];
    const [name, version] = key.split('@');
    dependencies[name] = {
      version,
      resolved: value.resolved,
      dependencies: value.dependencies,
    }
  })
  return dependencies;
}

