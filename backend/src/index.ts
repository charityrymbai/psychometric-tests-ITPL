import express from 'express';
import groupsRouter from './routes/groups.js';
import sectionsRouter from './routes/sections.js';
import tagsRouter from './routes/tags.js';
import questionsRouter from './routes/questions.js';

const app = express();
const port = 3002;

app.use(express.json());

app.use('/groups', groupsRouter);
app.use('/sections', sectionsRouter); 
app.use('/tags', tagsRouter);
app.use('/questions', questionsRouter);


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

