export const getGroups = (req, res) => {
  res.send('Groups Home');
};

export const createGroup = (req, res) => {
  res.send('Create Group');
};

export const updateGroup = (req, res) => {
  res.send(`Update Group ${req.params.id}`);
};

export const deleteGroup = (req, res) => {
  res.send(`Delete Group ${req.params.id}`);
};
