import { getTemplate, listTemplates } from '../services/templateService.js';

const handleError = (res, error) => {
  const status = error?.status || 500;
  res.status(status).json({ error: error.message || 'Unexpected error' });
};

export const getTemplates = async (req, res) => {
  try {
    const templates = await listTemplates();
    res.json(templates);
  } catch (error) {
    handleError(res, error);
  }
};

export const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await getTemplate(id);
    res.json(template);
  } catch (error) {
    handleError(res, error);
  }
};

