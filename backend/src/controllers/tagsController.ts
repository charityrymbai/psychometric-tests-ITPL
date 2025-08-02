import * as tagsService from '../services/tagsService.js';

export const getTags = async (req, res) => {
  const tags = await tagsService.getTags();
  res.json(tags);
};

export const getTagsBySection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const tags = await tagsService.getTagsBySection(sectionId);
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tags for section' });
  }
};

export const createTag = (req, res) => {
  const tagData = req.body;
  tagsService.createTag(tagData)
    .then(tag => res.status(201).json(tag))
    .catch(err => res.status(500).json({ error: err.message }));
};

export const createTagForSection = (req, res) => {
  const { sectionId } = req.params;
  const tagData = { ...req.body, section_id: sectionId };
  tagsService.createTag(tagData)
    .then(tag => res.status(201).json(tag))
    .catch(err => res.status(500).json({ error: err.message }));
};

export const updateTag = (req, res) => {
  const { id } = req.params;
  const tagData = req.body;
  tagsService.updateTag(id, tagData)
    .then(tag => res.json(tag))
    .catch(err => res.status(500).json({ error: err.message }));
};

export const deleteTag = (req, res) => {
  const { id } = req.params;
  tagsService.deleteTag(id)
    .then(() => res.status(200).json({ message: 'Tag deleted successfully' }))
    .catch(err => res.status(500).json({ error: err.message }));
};
