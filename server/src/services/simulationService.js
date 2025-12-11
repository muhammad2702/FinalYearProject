import fs from 'fs-extra';
import path from 'path';
import { spawn } from 'child_process';
import {
  BUILD_DIR,
  CSV_BASE_PATH,
  SIM_EXECUTABLE,
  SIM_EXECUTABLE_WSL,
  WSL_BUILD_DIR,
} from '../config/paths.js';
import { SIM_TIMEOUT_MS } from '../config/server.js';

const randomSuffix = () => Math.random().toString(36).slice(2, 9);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const readMetadata = async (metadataPath) => {
  if (!await fs.pathExists(metadataPath)) return {};

  const metadata = {};
  const content = await fs.readFile(metadataPath, 'utf-8');
  content.split('\n').forEach((line) => {
    const [key, value] = line.split(':').map((item) => item?.trim());
    if (key && value) metadata[key] = value;
  });
  return metadata;
};

const listDirectories = async (basePath) => {
  const entries = await fs.readdir(basePath);
  const dirs = [];

  for (const entry of entries) {
    const entryPath = path.join(basePath, entry);
    const stats = await fs.stat(entryPath);
    if (stats.isDirectory()) {
      dirs.push({ name: entry, path: entryPath, stats });
    }
  }

  return dirs;
};

const parseCsvFile = async (filePath) => {
  const content = await fs.readFile(filePath, 'utf-8');
  const lines = content.split('\n');
  const dataLines = lines.filter((line) => !line.startsWith('#') && line.trim());

  if (dataLines.length === 0) return null;

  const headers = dataLines[0].split(',');
  const rows = dataLines.slice(1).map((line) => {
    const values = line.split(',');
    const row = {};
    headers.forEach((header, i) => {
      const key = header.trim();
      const value = values[i];
      const parsed = parseFloat(value);
      row[key] = Number.isNaN(parsed) ? value : parsed;
    });
    return row;
  });

  return { headers, data: rows };
};

const resolveExecutionContext = async () => {
  const contexts = [
    {
      mode: 'native',
      execPath: SIM_EXECUTABLE,
      cwd: BUILD_DIR,
      join: path.join,
      shell: false,
      command: SIM_EXECUTABLE,
      useRelativeInput: false,
    },
    {
      mode: 'wsl',
      execPath: SIM_EXECUTABLE_WSL,
      cwd: WSL_BUILD_DIR,
      join: path.posix.join,
      shell: true,
      command: './financeSimulation',
      useRelativeInput: true,
    },
  ];

  for (const context of contexts) {
    try {
      if (await fs.pathExists(context.execPath)) {
        return context;
      }
    } catch {
      // ignore lookup errors and try next context
    }
  }

  throw new Error(
    'Simulation executable not found. Set SIM_EXECUTABLE or SIM_EXECUTABLE_WSL to a valid path.',
  );
};

export const listSimulations = async () => {
  if (!await fs.pathExists(CSV_BASE_PATH)) {
    return [];
  }

  const directories = await listDirectories(CSV_BASE_PATH);
  const simulations = [];

  for (const dir of directories) {
    const metadata = await readMetadata(path.join(dir.path, 'simulation_0_metadata.txt'));
    simulations.push({
      id: dir.name,
      name: dir.name,
      created: dir.stats.mtime,
      metadata,
    });
  }

  return simulations.sort((a, b) => b.created - a.created);
};

export const getSimulationData = async (id, collector) => {
  const simPath = path.join(CSV_BASE_PATH, id);
  if (!await fs.pathExists(simPath)) {
    const error = new Error('Simulation not found');
    error.status = 404;
    throw error;
  }

  const collectors = await listDirectories(simPath);
  const collectorNames = collectors.map((c) => c.name);

  if (collector) {
    if (!collectorNames.includes(collector)) {
      const error = new Error('Collector not found');
      error.status = 404;
      throw error;
    }

    const collectorPath = path.join(simPath, collector);
    const files = await fs.readdir(collectorPath);
    const csvFiles = files.filter((file) => file.endsWith('.csv'));

    const data = {};
    for (const file of csvFiles) {
      const parsed = await parseCsvFile(path.join(collectorPath, file));
      if (parsed) {
        data[file.replace('.csv', '')] = parsed;
      }
    }

    return { collector, data };
  }

  const collectorsSummary = {};
  for (const c of collectors) {
    const files = await fs.readdir(c.path);
    collectorsSummary[c.name] = files.filter((file) => file.endsWith('.csv'));
  }

  return { collectors: collectorsSummary };
};

export const getSimulationStats = async (id) => {
  const simPath = path.join(CSV_BASE_PATH, id);
  if (!await fs.pathExists(simPath)) {
    const error = new Error('Simulation not found');
    error.status = 404;
    throw error;
  }

  const stats = {};

  const pricePath = path.join(simPath, 'price', 'run_0_full.csv');
  if (await fs.pathExists(pricePath)) {
    const parsed = await parseCsvFile(pricePath);
    if (parsed?.data?.length) {
      const prices = parsed.data
        .map((row) => row[parsed.headers[1]])
        .filter((price) => typeof price === 'number' && !Number.isNaN(price));

      if (prices.length > 1) {
        const returns = [];
        for (let i = 1; i < prices.length; i += 1) {
          returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
        }

        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((a, b) => a + ((b - mean) ** 2), 0) / returns.length;
        const stdDev = Math.sqrt(variance);
        const skewness = returns.reduce((a, b) => a + (((b - mean) / stdDev) ** 3), 0) / returns.length;
        const kurtosis = returns.reduce((a, b) => a + (((b - mean) / stdDev) ** 4), 0) / returns.length - 3;
        const sharpeRatio = stdDev === 0 ? 0 : (mean / stdDev) * Math.sqrt(252);

        let maxPrice = prices[0];
        let maxDrawdown = 0;
        prices.forEach((price) => {
          if (price > maxPrice) maxPrice = price;
          const drawdown = (maxPrice - price) / maxPrice;
          if (drawdown > maxDrawdown) maxDrawdown = drawdown;
        });

        stats.price = {
          mean,
          volatility: stdDev,
          skewness,
          kurtosis,
          sharpeRatio,
          maxDrawdown,
          totalReturn: (prices[prices.length - 1] - prices[0]) / prices[0],
          minPrice: Math.min(...prices),
          maxPrice: Math.max(...prices),
        };
      }
    }
  }

  const skewPath = path.join(simPath, 'logreturn', 'run_0_skew.csv');
  if (await fs.pathExists(skewPath)) {
    const parsed = await parseCsvFile(skewPath);
    if (parsed?.data?.length) {
      stats.skew = parsed.data[0][parsed.headers[1]];
    }
  }

  const kurtosisPath = path.join(simPath, 'logreturn', 'run_0_excesskurtosis.csv');
  if (await fs.pathExists(kurtosisPath)) {
    const parsed = await parseCsvFile(kurtosisPath);
    if (parsed?.data?.length) {
      stats.excessKurtosis = parsed.data[0][parsed.headers[1]];
    }
  }

  return stats;
};

export const exportSimulationPath = async (id) => {
  const simPath = path.join(CSV_BASE_PATH, id);
  if (!await fs.pathExists(simPath)) {
    const error = new Error('Simulation not found');
    error.status = 404;
    throw error;
  }

  return simPath;
};

export const runSimulation = async (xmlContent, name) => {
  if (!xmlContent) {
    const error = new Error('XML content required');
    error.status = 400;
    throw error;
  }

  const context = await resolveExecutionContext();
  const joinPath = context.join;

  const tempDir = joinPath(context.cwd, 'temp');
  await fs.ensureDir(tempDir);

  const fileName = `input_${Date.now()}_${randomSuffix()}.xml`;
  const inputPath = joinPath(tempDir, fileName);
  await fs.writeFile(inputPath, xmlContent);

  const existingSimsBefore = await fs.pathExists(CSV_BASE_PATH)
    ? await fs.readdir(CSV_BASE_PATH)
    : [];

  const inputArg = context.useRelativeInput
    ? joinPath('./temp', fileName)
    : inputPath;

  return new Promise((resolve, reject) => {
    const child = spawn(context.command, [inputArg], {
      cwd: context.cwd,
      shell: context.shell,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
      console.log('Simulation output:', data.toString());
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
      console.error('Simulation error:', data.toString());
    });

    const timeout = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error('Simulation timed out'));
    }, SIM_TIMEOUT_MS);

    const cleanup = async () => {
      clearTimeout(timeout);
      if (await fs.pathExists(inputPath)) {
        await fs.remove(inputPath);
      }
    };

    child.on('close', async (code) => {
      await cleanup();

      if (code !== 0) {
        reject(new Error(`Simulation failed with exit code ${code}: ${stderr || stdout}`));
        return;
      }

      await delay(1000);

      try {
        const existingSimsAfter = await fs.readdir(CSV_BASE_PATH);
        const newSims = existingSimsAfter.filter((sim) => !existingSimsBefore.includes(sim));

        let latest;
        if (newSims.length > 0) {
          latest = newSims[0];
        } else if (existingSimsAfter.length > 0) {
          const simsWithStats = await Promise.all(
            existingSimsAfter.map(async (sim) => ({
              name: sim,
              mtime: (await fs.stat(path.join(CSV_BASE_PATH, sim))).mtime,
            })),
          );
          simsWithStats.sort((a, b) => b.mtime - a.mtime);
          latest = simsWithStats[0]?.name;
        }

        resolve({
          success: true,
          simulationId: latest || 'unknown',
          output: stdout,
          name,
        });
      } catch (err) {
        reject(err);
      }
    });

    child.on('error', async (err) => {
      await cleanup();
      reject(new Error(`Failed to start simulation process: ${err.message}`));
    });
  });
};

