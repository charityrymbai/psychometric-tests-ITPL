import * as groupsService from '../services/groupsService.js';

export const getGroups = async (req, res) => {
  const groups = await groupsService.getAllGroups();
  res.json(groups);
};

export const createGroup = async (req, res) => {
  const body = req.body; 

  const response = await groupsService.createGroupInDB(body.name, body.description, body.startingClass, body.endingClass);

  if (response.success) {
    res.status(201).json({
      message: 'Group created successfully',
      groupId: response.groupId,
    });
  } else {
    res.status(500).json({
      message: 'Failed to create group',
      error: response.error,
    });
  }
};

export const updateGroup = (req, res) => {
  const id = req.params.id;
  const groupData = req.body;

  groupsService.updateGroup(id, groupData)
    .then(response => {
      if (response.success) {
        res.json({
          message: 'Group updated successfully',
          affectedRows: response.affectedRows,
        });
      } else {
        res.status(500).json({
          message: 'Failed to update group',
          error: response.error,
        });
      }
    })
    .catch(error => {
      res.status(500).json({ message: 'Error updating group', error });
    });
};

export const deleteGroup = (req, res) => {
  const id = req.params.id;

  groupsService.deleteGroup(id)
    .then(response => {
      if (response.success) {
        res.json({
          message: 'Group deleted successfully',
          affectedRows: response.affectedRows,
        });
      } else {
        res.status(500).json({
          message: 'Failed to delete group',
          error: response.error,
        });
      }
    })
    .catch(error => {
      res.status(500).json({ message: 'Error deleting group', error });
    });
};
