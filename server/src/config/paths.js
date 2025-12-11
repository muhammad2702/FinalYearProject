import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Monorepo root (one level above /server)
const ROOT_DIR = path.resolve(__dirname, '..', '..', '..');
const BUILD_DIR = process.env.SIM_BUILD_DIR || path.join(ROOT_DIR, 'build', 'src');
const CSV_BASE_PATH = process.env.SIM_CSV_BASE_PATH || path.join(BUILD_DIR, 'output', 'csv_export');
const INPUT_EXAMPLES_PATH = process.env.SIM_INPUT_TEMPLATES || path.join(ROOT_DIR, 'input', 'examples');

// Native execution (Windows build output)
const SIM_EXECUTABLE = process.env.SIM_EXECUTABLE || path.join(BUILD_DIR, 'financeSimulation');

// Optional WSL/Linux execution path
const WSL_BUILD_DIR = process.env.SIM_BUILD_DIR_WSL || '/mnt/c/Users/muham/OneDrive/Desktop/FinalYearProject/build/src';
const SIM_EXECUTABLE_WSL = process.env.SIM_EXECUTABLE_WSL || path.posix.join(WSL_BUILD_DIR, 'financeSimulation');

export {
  ROOT_DIR,
  BUILD_DIR,
  CSV_BASE_PATH,
  INPUT_EXAMPLES_PATH,
  SIM_EXECUTABLE,
  WSL_BUILD_DIR,
  SIM_EXECUTABLE_WSL,
};

