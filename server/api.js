import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Base path for CSV exports (simulation writes to ./output from its working directory)
const CSV_BASE_PATH = path.join(__dirname, '../build/src/output/csv_export');
const INPUT_EXAMPLES_PATH = path.join(__dirname, '../input/examples');

// API: Get list of available simulations
app.get('/api/simulations', async (req, res) => {
  try {
    if (!await fs.pathExists(CSV_BASE_PATH)) {
      return res.json([]);
    }

    const dirs = await fs.readdir(CSV_BASE_PATH);
    const simulations = [];

    for (const dir of dirs) {
      const dirPath = path.join(CSV_BASE_PATH, dir);
      const stats = await fs.stat(dirPath);

      if (stats.isDirectory()) {
        const metadataPath = path.join(dirPath, 'simulation_0_metadata.txt');
        let metadata = {};

        if (await fs.pathExists(metadataPath)) {
          const content = await fs.readFile(metadataPath, 'utf-8');
          content.split('\n').forEach(line => {
            const [key, value] = line.split(':').map(s => s.trim());
            if (key && value) metadata[key] = value;
          });
        }

        simulations.push({
          id: dir,
          name: dir,
          created: stats.mtime,
          metadata
        });
      }
    }

    res.json(simulations.sort((a, b) => b.created - a.created));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Get simulation data
app.get('/api/simulations/:id/data', async (req, res) => {
  try {
    const { id } = req.params;
    const { collector } = req.query;

    const simPath = path.join(CSV_BASE_PATH, id);
    if (!await fs.pathExists(simPath)) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    // Get available collectors (directories)
    const collectors = (await fs.readdir(simPath))
      .filter(async item => {
        const itemPath = path.join(simPath, item);
        return (await fs.stat(itemPath)).isDirectory();
      });

    // If specific collector requested
    if (collector) {
      const collectorPath = path.join(simPath, collector);
      if (!await fs.pathExists(collectorPath)) {
        return res.status(404).json({ error: 'Collector not found' });
      }

      const files = await fs.readdir(collectorPath);
      const csvFiles = files.filter(f => f.endsWith('.csv'));

      const data = {};
      for (const file of csvFiles) {
        const filePath = path.join(collectorPath, file);
        const content = await fs.readFile(filePath, 'utf-8');

        // Parse CSV
        const lines = content.split('\n');
        const dataLines = lines.filter(line => !line.startsWith('#') && line.trim());

        if (dataLines.length > 0) {
          const headers = dataLines[0].split(',');
          const rows = dataLines.slice(1).map(line => {
            const values = line.split(',');
            const row = {};
            headers.forEach((header, i) => {
              row[header.trim()] = parseFloat(values[i]) || values[i];
            });
            return row;
          });

          data[file.replace('.csv', '')] = {
            headers,
            data: rows
          };
        }
      }

      return res.json({ collector, data });
    }

    // Return all collectors summary
    const allData = {};
    const dirs = await fs.readdir(simPath);

    for (const dir of dirs) {
      const dirPath = path.join(simPath, dir);
      const stat = await fs.stat(dirPath);

      if (stat.isDirectory()) {
        const files = await fs.readdir(dirPath);
        const csvFiles = files.filter(f => f.endsWith('.csv'));
        allData[dir] = csvFiles;
      }
    }

    res.json({ collectors: allData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Get list of available XML templates
app.get('/api/templates', async (req, res) => {
  try {
    const files = await fs.readdir(INPUT_EXAMPLES_PATH);
    const xmlFiles = files.filter(f => f.endsWith('.xml'));

    const templates = await Promise.all(
      xmlFiles.map(async file => {
        const content = await fs.readFile(path.join(INPUT_EXAMPLES_PATH, file), 'utf-8');
        return {
          id: file.replace('.xml', ''),
          name: file,
          path: path.join(INPUT_EXAMPLES_PATH, file),
          content
        };
      })
    );

    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Get specific XML template
app.get('/api/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const filePath = path.join(INPUT_EXAMPLES_PATH, `${id}.xml`);

    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const content = await fs.readFile(filePath, 'utf-8');
    res.json({ id, content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Run simulation with parameters
app.post('/api/run-simulation', async (req, res) => {
  try {
    const { xmlContent, name } = req.body;

    if (!xmlContent) {
      return res.status(400).json({ error: 'XML content required' });
    }

    // Create temporary input file
    const tempDir = path.join(__dirname, 'temp');
    await fs.ensureDir(tempDir);

    const timestamp = Date.now();
    const inputFile = path.join(tempDir, `sim_${timestamp}.xml`);
    await fs.writeFile(inputFile, xmlContent);

    // Path to simulation executable
    const execPath = path.join(__dirname, '../build/src/financeSimulation');

    if (!await fs.pathExists(execPath)) {
      await fs.remove(inputFile);
      return res.status(500).json({
        error: 'Simulation executable not found at: ' + execPath,
        hint: 'Make sure SABCEMM is built. Run: cd build && cmake .. && make'
      });
    }

    console.log('Running simulation with executable:', execPath);
    console.log('Input file:', inputFile);

    // Get list of existing simulations before running
    const existingSimsBefore = await fs.pathExists(CSV_BASE_PATH)
      ? await fs.readdir(CSV_BASE_PATH)
      : [];

    // Run simulation
    const child = spawn(execPath, [inputFile], {
      cwd: path.join(__dirname, '../build/src')
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      console.log('Simulation output:', output);
    });

    child.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      console.error('Simulation error:', output);
    });

    child.on('close', async (code) => {
      console.log('Simulation process exited with code:', code);

      // Cleanup temp file
      await fs.remove(inputFile);

      if (code !== 0) {
        return res.status(500).json({
          error: 'Simulation failed with exit code ' + code,
          details: stderr || stdout,
          stdout,
          stderr
        });
      }

      // Wait a bit for files to be written
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Find the new simulation output
      try {
        const existingSimsAfter = await fs.readdir(CSV_BASE_PATH);
        const newSims = existingSimsAfter.filter(s => !existingSimsBefore.includes(s));

        let latest;
        if (newSims.length > 0) {
          latest = newSims[0];
        } else {
          // Fallback: get the most recent one
          const allSims = existingSimsAfter;
          const simsWithStats = await Promise.all(
            allSims.map(async (sim) => ({
              name: sim,
              mtime: (await fs.stat(path.join(CSV_BASE_PATH, sim))).mtime
            }))
          );
          simsWithStats.sort((a, b) => b.mtime - a.mtime);
          latest = simsWithStats[0]?.name;
        }

        console.log('Latest simulation:', latest);

        res.json({
          success: true,
          simulationId: latest || 'unknown',
          output: stdout,
          message: 'Simulation completed successfully!'
        });
      } catch (err) {
        console.error('Error finding simulation output:', err);
        res.json({
          success: true,
          simulationId: 'unknown',
          output: stdout,
          warning: 'Simulation ran but output directory not found'
        });
      }
    });

    child.on('error', (err) => {
      console.error('Failed to start simulation:', err);
      fs.remove(inputFile);
      res.status(500).json({
        error: 'Failed to start simulation process',
        details: err.message
      });
    });

  } catch (error) {
    console.error('Run simulation error:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// API: Export simulation data as ZIP or CSV
app.get('/api/simulations/:id/export', async (req, res) => {
  try {
    const { id } = req.params;
    const simPath = path.join(CSV_BASE_PATH, id);

    if (!await fs.pathExists(simPath)) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    // For now, return the simulation path
    // In future, we could zip the entire directory
    res.json({
      success: true,
      path: simPath,
      message: 'Simulation data available at: ' + simPath
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Get simulation statistics
app.get('/api/simulations/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    const simPath = path.join(CSV_BASE_PATH, id);

    if (!await fs.pathExists(simPath)) {
      return res.status(404).json({ error: 'Simulation not found' });
    }

    const stats = {};

    // Read price data for returns calculation
    const pricePath = path.join(simPath, 'price/run_0_full.csv');
    if (await fs.pathExists(pricePath)) {
      const content = await fs.readFile(pricePath, 'utf-8');
      const lines = content.split('\n').filter(line => !line.startsWith('#') && line.trim());

      if (lines.length > 1) {
        const prices = lines.slice(1).map(line => parseFloat(line.split(',')[1])).filter(p => !isNaN(p));

        // Calculate returns
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
          returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
        }

        // Calculate statistics
        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
        const stdDev = Math.sqrt(variance);

        // Skewness
        const skewness = returns.reduce((a, b) => a + Math.pow((b - mean) / stdDev, 3), 0) / returns.length;

        // Kurtosis
        const kurtosis = returns.reduce((a, b) => a + Math.pow((b - mean) / stdDev, 4), 0) / returns.length - 3;

        // Sharpe ratio (assuming risk-free rate = 0)
        const sharpeRatio = mean / stdDev * Math.sqrt(252); // Annualized

        // Max drawdown
        let maxPrice = prices[0];
        let maxDrawdown = 0;
        prices.forEach(price => {
          if (price > maxPrice) maxPrice = price;
          const drawdown = (maxPrice - price) / maxPrice;
          if (drawdown > maxDrawdown) maxDrawdown = drawdown;
        });

        stats.price = {
          mean: mean,
          volatility: stdDev,
          skewness,
          kurtosis,
          sharpeRatio,
          maxDrawdown,
          totalReturn: (prices[prices.length - 1] - prices[0]) / prices[0],
          minPrice: Math.min(...prices),
          maxPrice: Math.max(...prices)
        };
      }
    }

    // Read skewness and kurtosis if available
    const skewPath = path.join(simPath, 'logreturn/run_0_skew.csv');
    if (await fs.pathExists(skewPath)) {
      const content = await fs.readFile(skewPath, 'utf-8');
      const lines = content.split('\n').filter(line => !line.startsWith('#') && line.trim());
      if (lines.length > 1) {
        stats.skew = parseFloat(lines[1].split(',')[1]);
      }
    }

    const kurtosisPath = path.join(simPath, 'logreturn/run_0_excesskurtosis.csv');
    if (await fs.pathExists(kurtosisPath)) {
      const content = await fs.readFile(kurtosisPath, 'utf-8');
      const lines = content.split('\n').filter(line => !line.startsWith('#') && line.trim());
      if (lines.length > 1) {
        stats.excessKurtosis = parseFloat(lines[1].split(',')[1]);
      }
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`SABCEMM API Server running on http://localhost:${PORT}`);
});
