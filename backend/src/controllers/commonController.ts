import * as commonService from '../services/commonService.js';

export const getAllGroupsWithSections = async (req, res) => {
  try {
    const data = await commonService.getAllGroupsWithSections();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
