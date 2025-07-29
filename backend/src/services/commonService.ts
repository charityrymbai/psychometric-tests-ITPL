export const getAllGroupsWithSections = async () => {
  const groups = await groupsService.getAllGroups();
  const sections = await sectionsService.getAllSections();

  return groups.map(group => ({
    ...group,
    sections: sections.filter(section => section.groupId === group.id),
  }));
};
