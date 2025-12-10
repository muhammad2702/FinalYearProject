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
    console.log('Fetching simulations from:', CSV_BASE_PATH);
    if (!await fs.pathExists(CSV_BASE_PATH)) {
      console.log('No simulations found, CSV base path does not exist:', CSV_BASE_PATH);
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
    console.log('Available templates:', templates.map(t => t.name));
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
app.post('/api/run-sim', async (req, res) => {
  let tempInputPath = null;
  let child = null;
  
  try {
    const { xmlContent, name } = req.body;
    
    if (!xmlContent || !name) {
      return res.status(400).json({ error: 'Missing xmlContent or name' });
    }
    
    // Create temp directory
    const tempDir = path.join(process.cwd(), 'temp');
    await fs.ensureDir(tempDir);
    
    // Create unique filename
    const timestamp = Date.now();
    tempInputPath = path.join(tempDir, `${name}_${timestamp}.xml`);
    
    console.log('Creating temp file:', tempInputPath);
    await fs.writeFile(tempInputPath, xmlContent);
    console.log('Temp file created successfully');

    const buildDir = path.join(process.cwd(), '../build/src');
    const exePath = path.join(buildDir, 'financeSimulation');
    
    console.log('Looking for executable:', exePath);
    if (!(await fs.pathExists(exePath))) {
      throw new Error(`Simulation executable not found at: ${exePath}`);
    }
    
    console.log('Executable found, starting simulation...');

    return new Promise((resolve, reject) => {
      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        if (child) {
          child.kill('SIGKILL');
          console.error('Simulation timed out after 30 seconds');
          reject(new Error('Simulation timed out'));
        }
      }, 30000); // 30 second timeout

      // Spawn the process
      child = spawn(exePath, [tempInputPath], { 
        cwd: buildDir,
        stdio: ['pipe', 'pipe', 'pipe'] // Explicitly set stdio
      });
      
      console.log(`Spawned process PID: ${child.pid}`);
      
      let stdoutOutput = '';
      let stderrOutput = '';
      
      // Capture stdout
      child.stdout.on('data', (data) => {
        stdoutOutput += data.toString();
        console.log('Simulation stdout:', data.toString());
      });

      // Capture stderr
      child.stderr.on('data', (data) => {
        stderrOutput += data.toString();
        console.log('Simulation stderr:', data.toString());
      });

      child.on('error', (error) => {
        clearTimeout(timeout);
        console.error('Spawn error:', error);
        reject(new Error(`Failed to start simulation: ${error.message}`));
      });

      child.on('close', async (code, signal) => {
        clearTimeout(timeout);
        console.log(`Process closed with code: ${code}, signal: ${signal}`);
        console.log('Full stderr output:', stderrOutput);
        
        try {
          // Clean up temp file
          if (tempInputPath && await fs.pathExists(tempInputPath)) {
            await fs.unlink(tempInputPath);
            console.log('Cleaned up temp file');
          }
          
          if (code !== 0) {
            console.error('Simulation failed with code:', code);
            console.error('stderr:', stderrOutput);
            console.error('stdout:', stdoutOutput);
            
            // Try to provide more helpful error messages
            let errorMsg = `Simulation failed with exit code ${code}`;
            if (stderrOutput.includes('error')) {
              errorMsg += `: ${stderrOutput.split('\n')[0]}`;
            }
            return reject(new Error(errorMsg));
          }

          console.log('Simulation completed successfully');
          console.log('Looking for output files...');
          
          const outputDir = path.join(buildDir, 'output');
          
          if (!(await fs.pathExists(outputDir))) {
            console.error('Output directory not found:', outputDir);
            return reject(new Error(`Output directory not found: ${outputDir}`));
          }
          
          const files = await fs.readdir(outputDir);
          console.log('All files in output dir:', files);
          
          const outputFiles = files.filter(f => 
            f.startsWith(name + '_') && f.endsWith('.xml')
          ).sort((a, b) => b.localeCompare(a));
          
          console.log('Matching output files:', outputFiles);
          
          if (outputFiles.length === 0) {
            return reject(new Error(`No output file found for name: ${name}`));
          }

          const latestOutput = path.join(outputDir, outputFiles[0]);
          console.log('Reading output file:', latestOutput);
          
          const xml = await fs.readFile(latestOutput, 'utf8');
          const parsed = await parseStringPromise(xml);

          // Safer XML navigation
          const results = parsed.results;
          if (!results) {
            return reject(new Error('Invalid XML structure: no results'));
          }
          
          const sim0 = results['cross_simulation_0'] || 
                       (results.cross_simulation && results.cross_simulation[0]);
          
          if (!sim0 || !sim0.output || !sim0.output[0]) {
            return reject(new Error('Invalid XML structure: missing simulation data'));
          }

          const output = sim0.output[0];
          const prices = output.price && output.price[0]?.full?.[0]?.['r_0']?.[0]?.['c_0']?.map(p => parseFloat(p));
          
          if (!prices) {
            return reject(new Error('Invalid XML structure: missing price data'));
          }

          const logreturn = output.logreturn && output.logreturn[0];
          const skew = logreturn?.skew?.[0]?.['r_0']?.[0]?.['c_0']?.[0];
          const kurtosis = logreturn?.excesskurtosis?.[0]?.['r_0']?.[0]?.['c_0']?.[0];

          console.log(`Successfully parsed ${prices.length} price points`);
          
          resolve({ 
            prices, 
            skew: skew ? parseFloat(skew) : null,
            kurtosis: kurtosis ? parseFloat(kurtosis) : null,
            agentCount: 100 
          });
          
        } catch (error) {
          console.error('Error in cleanup/parsing:', error);
          reject(error);
        }
      });
      
    }).then(result => {
      console.log('Sending successful response');
      res.json(result);
    }).catch(error => {
      console.error('Promise rejection:', error);
      res.status(500).json({ error: error.message });
    });

  } catch (error) {
    console.error('Top-level catch error:', error);
    
    // Cleanup if file was created
    if (tempInputPath) {
      try {
        if (await fs.pathExists(tempInputPath)) {
          await fs.unlink(tempInputPath);
          console.log('Cleaned up temp file on error');
        }
      } catch (cleanupError) {
        console.error('Failed to cleanup temp file:', cleanupError);
      }
    }
    
    // Kill child process if it exists
    if (child) {
      child.kill('SIGKILL');
    }
    
    res.status(500).json({ error: error.message });
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
