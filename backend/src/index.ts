import express from 'express';
import cors from 'cors';
import groupsRouter from './routes/groups.js';
import sectionsRouter from './routes/sections.js';
import tagsRouter from './routes/tags.js';
import questionsRouter from './routes/questions.js';
import commonRouter from './routes/common.js';
import reportsRouter from './routes/reports.js';

const app = express();
const port = 3002;
const host = '0.0.0.0';

app.use(express.json());
app.use(cors());

app.options('*', (req, res) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization'
  });
  res.sendStatus(204);
});

app.use('/', commonRouter); 
app.use('/groups', groupsRouter);
app.use('/sections', sectionsRouter); 
app.use('/tags', tagsRouter);
app.use('/questions', questionsRouter);
app.use('/reports', reportsRouter);


app.listen(port, () => {
  console.log(`Server is running at http://0.0.0.0:${port}`);
});

