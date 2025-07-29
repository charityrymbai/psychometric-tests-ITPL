import * as sectionsService from '../services/sectionsService.js';

export const getSections = async (req, res) => {
  const { groupId } = req.params;
  const sections = await sectionsService.getSections(groupId);
  res.json(sections);
};

export const createSection = (req, res) => {
  const { groupId } = req.params;
  const sectionData = req.body;
  sectionsService.createSection(groupId, sectionData)
    .then(section => res.status(201).json(section))
    .catch(err => res.status(500).json({ error: err.message }));
};

export const updateSection = (req, res) => {
  const { groupId, sectionId } = req.params;
  const sectionData = req.body;
  sectionsService.updateSection(groupId, sectionId, sectionData)
    .then(section => res.json(section))
    .catch(err => res.status(500).json({ error: err.message }));
};

export const deleteSection = (req, res) => {
  const { groupId, sectionId } = req.params;
  sectionsService.deleteSection(groupId, sectionId)
    .then(() => res.status(200).json({ message: 'Section deleted successfully' }))
    .catch(err => res.status(500).json({ error: err.message }));
};
