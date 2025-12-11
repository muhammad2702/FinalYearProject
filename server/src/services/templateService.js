import fs from 'fs-extra';
import path from 'path';
import { INPUT_EXAMPLES_PATH } from '../config/paths.js';

export const listTemplates = async () => {
  console.log('INPUT_EXAMPLES_PATH', INPUT_EXAMPLES_PATH);
  if (!await fs.pathExists(INPUT_EXAMPLES_PATH)) {
    return [];
  }

  const files = await fs.readdir(INPUT_EXAMPLES_PATH);
  const xmlFiles = files.filter((file) => file.endsWith('.xml'));

  const templates = await Promise.all(
    xmlFiles.map(async (file) => {
      const content = await fs.readFile(path.join(INPUT_EXAMPLES_PATH, file), 'utf-8');
      return {
        id: file.replace('.xml', ''),
        name: file,
        path: path.join(INPUT_EXAMPLES_PATH, file),
        content,
      };
    }),
  );

  return templates;
};

export const getTemplate = async (id) => {
  const filePath = path.join(INPUT_EXAMPLES_PATH, `${id}.xml`);
  if (!await fs.pathExists(filePath)) {
    const error = new Error('Template not found');
    error.status = 404;
    throw error;
  }

  const content = await fs.readFile(filePath, 'utf-8');
  return { id, content };
};

