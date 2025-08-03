import { Request, Response } from 'express';
import * as sectionsService from '../services/sectionsService.js';
import { createMultipleTags, deleteTagsBySection } from '../services/tagsService.js';

export const getSections = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const sections = await sectionsService.getAllSections();
  res.json(sections);
};

export const createSection = async (req: Request, res: Response) => {
  const groupId = req.params.groupId;
  const sectionData = req.body;

  console.log("Creating section:", groupId, sectionData);

  try {
    const newSection = await sectionsService.createSection(groupId, sectionData);
    
    if (!sectionData.isSingleOptionCorrect) {
      const tags = sectionData.tags || [];
      if (tags.length > 0) {
        const tagsWithName = tags.map((tag: any) => ({
          ...tag,
          name: tag.label || tag.name,
          section_id: newSection.id
        }));
        const rowsAffected = await createMultipleTags(tagsWithName);
        console.log(`Created ${rowsAffected} tags for section ${newSection.id}`);
        if (rowsAffected === 0) {
          throw new Error("Failed to create tags for the section");
        }
      }
    }
    res.status(201).json(newSection);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const updateSection = async (req: Request, res: Response) => {
  const { groupId, sectionId } = req.params;
  const sectionData = req.body;

  try {
    const updatedSection = await sectionsService.updateSection(groupId, sectionId, sectionData);

    // Handle tags update if not isSingleOptionCorrect
    if (!sectionData.isSingleOptionCorrect) {
      // First, delete existing tags for this section
      await deleteTagsBySection(Number(sectionId));
      
      const tags = sectionData.tags || [];
      if (tags.length > 0) {
        const tagsWithName = tags.map((tag: any) => ({
          ...tag,
          name: tag.label || tag.name,
          section_id: Number(sectionId)
        }));
        const rowsAffected = await createMultipleTags(tagsWithName);
        console.log(`Updated/created ${rowsAffected} tags for section ${sectionId}`);
      }
    } else {
      // If section becomes single option correct, delete all existing tags
      await deleteTagsBySection(Number(sectionId));
    }

    res.json(updatedSection);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const deleteSection = async (req: Request, res: Response) => {
  const { sectionId } = req.params;
  
  try {
    await sectionsService.deleteSection(sectionId);
    res.status(200).json({ message: 'Section deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getSectionByGroupId = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  try {
    const section = await sectionsService.getSectionByGroupId(groupId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    res.json(section);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

