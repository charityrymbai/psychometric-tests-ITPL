export const getQuestions = (req, res) => {
  res.send('Questions Home');
};

export const createQuestion = (req, res) => {
  res.send('Create Question');
};

export const updateQuestion = (req, res) => {
  res.send(`Update Question ${req.params.id}`);
};

export const deleteQuestion = (req, res) => {
  res.send(`Delete Question ${req.params.id}`);
};
