import fs from 'fs-extra'

export const getNpmDependencies = async (filePath: string) => {
  const packageJson = await fs.readJson(filePath);
  const dependencies = packageJson.dependencies;
  return dependencies
}

