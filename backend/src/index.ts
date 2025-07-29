import express from 'express';
import cors from 'cors';
import groupsRouter from './routes/groups.js';
import sectionsRouter from './routes/sections.js';
import tagsRouter from './routes/tags.js';
import questionsRouter from './routes/questions.js';
import commonRouter from './routes/common.js';

const app = express();
const port = 3002;

app.use(express.json());
app.use(cors()); 

app.use('/', commonRouter); 
app.use('/groups', groupsRouter);
app.use('/sections', sectionsRouter); 
app.use('/tags', tagsRouter);
app.use('/questions', questionsRouter);


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

