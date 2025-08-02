import { Request, Response } from 'express';
import * as commonService from '../services/commonService.js';

export const getAllGroupsWithSections = async (req: Request, res: Response) => {
  const groups = await commonService.getAllGroupsWithSections();
  res.json(groups);
};
