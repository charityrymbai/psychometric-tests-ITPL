import * as userService from '../services/userService.js';

export const getUser = (req, res) => {
  const { id } = req.params;
  userService.getUser(id)
    .then(user => res.json(user))
    .catch(err => res.status(500).json({ error: err.message }));
};

export const createUser = (req, res) => {
  const { id } = req.params;
  const userData = req.body;
  
  // Log the received ID for debugging
  console.log(`Creating user with ID param: ${id}, type: ${typeof id}`);
  
  userService.createUser(id, userData)
    .then(userId => {
      console.log(`User created successfully with ID: ${userId}`);
      res.status(201).json({message: 'User created successfully', user_id: userId});
    })
    .catch(err => {
      console.error(`Failed to create user: ${err.message}`);
      res.status(500).json({ error: err.message });
    });
};

export const updateUser = (req, res) => {
  const { id } = req.params;
  const userData = req.body;
  userService.updateUser(id, userData)
    .then(user => res.json(user))
    .catch(err => res.status(500).json({ error: err.message }));
};

export const deleteUser = (req, res) => {
  const { id } = req.params;
  userService.deleteUser(id)
    .then(() => res.status(200).json({ message: 'User deleted successfully' }))
    .catch(err => res.status(500).json({ error: err.message }));
};
