import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const versionPath = path.join(__dirname, '../public/version.json');
const packageJsonPath = path.join(__dirname, '../package.json');

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

const versionInfo = {
  version: packageJson.version,
  buildTime: new Date().toISOString()
};

fs.writeFileSync(versionPath, JSON.stringify(versionInfo, null, 2));

console.log('Updated version.json:', versionInfo);
