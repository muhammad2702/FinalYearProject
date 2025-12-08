import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs-extra';
import path from 'path';
import { spawn } from 'child_process';
import { parseStringPromise } from 'xml2js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/run-sim', async (req, res) => {
  try {
    const { params } = req.body;
    const filename = 'sabcemm-run';
    const xmlTemplate = `<settings>
  <writer>writertxt</writer>
  <filename>${filename}</filename>
  <simulationsperfile>1</simulationsperfile>
  <numthreads>1</numthreads>
  <case>
    <RNGSettings>
      <RNG>RandomGeneratorStdLib</RNG>
    </RNGSettings>
    <agents>
      <AgentCross>
        <count>${params.count || 100}</count>
        <b1>${params.b1 || 25}</b1>
        <b2>${params.b2 || 100}</b2>
        <A1>${params.A1 || 0.1}</A1>
        <A2>${params.A2 || 0.3}</A2>
        <cash>${params.cash || 1}</cash>
        <stock>${params.stock || 1}</stock>
      </AgentCross>
    </agents>
    <qoi>
      <price>
        <full/>
      </price>
      <logreturn>
        <skew/>
        <excessKurtosis/>
      </logreturn>
    </qoi>
    <numsteps>${params.numsteps || 10000}</numsteps>
    <outputname>Cross_Simulation</outputname>
    <deltaT>${params.deltaT || 0.00004}</deltaT>
    <excessDemandCalculatorSettings>
      <excessDemandCalculatorClass>ExcessDemandCalculatorHarras</excessDemandCalculatorClass>
    </excessDemandCalculatorSettings>
    <priceCalculatorSettings>
      <priceCalculatorClass>PriceCalculatorCross</priceCalculatorClass>
      <theta>${params.theta || 2}</theta>
      <marketDepth>${params.marketDepth || 0.2}</marketDepth>
    </priceCalculatorSettings>
    <repetitions>1</repetitions>
    <startPrice>${params.startPrice || 1}</startPrice>
  </case>
</settings>`;

    const tempInputPath = path.join(process.cwd(), 'server/temp/input.xml');
    await fs.ensureDir(path.dirname(tempInputPath));
    await fs.writeFile(tempInputPath, xmlTemplate);

    const child = spawn('bash', ['-c', `cd ../build/src && ./financeSimulation ${tempInputPath}`], { cwd: process.cwd() });

    child.on('close', async (code) => {
      if (code !== 0) {
        return res.status(500).json({ error: 'Simulation failed' });
      }

      const outputDir = path.join(process.cwd(), 'build/src/output');
      const files = await fs.readdir(outputDir);
      const outputFiles = files.filter(f => f.startsWith(filename + '_') && f.endsWith('.xml')).sort((a, b) => b.localeCompare(a));
      if (outputFiles.length === 0) {
        return res.status(500).json({ error: 'No output file found' });
      }

      const latestOutput = path.join(outputDir, outputFiles[0]);
      const xml = await fs.readFile(latestOutput, 'utf8');
      const parsed = await parseStringPromise(xml);

      const sim0 = parsed.results['cross_simulation_0'] || parsed.results.cross_simulation[0];
      const prices = sim0.output[0].price[0].full[0].r_0[0].c_0.map(p => parseFloat(p));
      const logreturn = sim0.output[0].logreturn[0];
      const skew = parseFloat(logreturn.skew[0].r_0[0].c_0[0]);
      const kurtosis = parseFloat(logreturn.excesskurtosis[0].r_0[0].c_0[0]);

      res.json({ prices, skew, kurtosis, agentCount: params.count || 100 });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`SABCEMM Backend running on http://localhost:${PORT}`);
});
