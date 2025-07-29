import * as commonService from '../services/commonService.js';

export const getAllGroupsWithSections = async (req, res) => {
  const groups = await commonService.getAllGroupsWithSections();
  res.json(groups);
};
