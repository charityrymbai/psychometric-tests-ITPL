import * as groupsService from '../services/groupsService.js';
import * as sectionsService from '../services/sectionsService.js';
import * as questionsService from '../services/questionsService.js';

export const getAllGroupsWithSections = async () => {
  const groups: any[] = await groupsService.getAllGroups();
  const sectionsRaw: any[] = await sectionsService.getAllSections();
  const questionsCountArr: any[] = await questionsService.getQuestionsCountBySection();

  // Map section_id to count
  const questionsCountMap: Record<string, number> = {};
  questionsCountArr.forEach((row: any) => {
    questionsCountMap[String(row.section_id)] = row.count;
  });

  // Map section fields from snake_case to camelCase and add questions count
  const sections = sectionsRaw.map((section: any) => ({
    id: section.id,
    name: section.name,
    description: section.description,
    groupId: section.group_id,
    isSingleOptionCorrect: typeof section.isSingleOptionCorrect === 'object' && section.isSingleOptionCorrect !== null && 'data' in section.isSingleOptionCorrect
      ? Boolean(section.isSingleOptionCorrect.data[0])
      : Boolean(section.isSingleOptionCorrect),
    questions: questionsCountMap[String(section.id)] || 0
  }));

  // Group sections by groupId
  const sectionsByGroupId = sections.reduce((acc: any, section: any) => {
    if (!acc[section.groupId]) acc[section.groupId] = [];
    acc[section.groupId].push(section);
    return acc;
  }, {});

  return groups.map((group: any) => ({
    ...group,
    sections: sectionsByGroupId[group.id] || [],
  }));
};
