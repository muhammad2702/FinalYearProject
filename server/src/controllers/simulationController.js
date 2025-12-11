import {
  exportSimulationPath,
  getSimulationData as getSimulationDataService,
  getSimulationStats as getSimulationStatsService,
  listSimulations,
  runSimulation as runSimulationService,
} from '../services/simulationService.js';

const handleError = (res, error) => {
  const status = error?.status || 500;
  res.status(status).json({ error: error.message || 'Unexpected error' });
};

export const getSimulations = async (req, res) => {
  try {
    const simulations = await listSimulations();
    res.json(simulations);
  } catch (error) {
    handleError(res, error);
  }
};

export const getSimulationData = async (req, res) => {
  try {
    const { id } = req.params;
    const { collector } = req.query;
    const data = await getSimulationDataService(id, collector);
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const getSimulationStats = async (req, res) => {
  try {
    const { id } = req.params;
    const stats = await getSimulationStatsService(id);
    res.json(stats);
  } catch (error) {
    handleError(res, error);
  }
};

export const exportSimulation = async (req, res) => {
  try {
    const { id } = req.params;
    const simPath = await exportSimulationPath(id);
    res.json({
      success: true,
      path: simPath,
      message: `Simulation data available at: ${simPath}`,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const runSimulation = async (req, res) => {
  try {
    const { xmlContent, name } = req.body;
    const result = await runSimulationService(xmlContent, name);
    res.json(result);
  } catch (error) {
    handleError(res, error);
  }
};

