import express from 'express';
import bodyParser from 'body-parser';
import db from './db.js';
import cors from 'cors';

import {
  createTaskListTableQuery,
  createUsersTableQuery,
} from './utils/query.js';

import { login, register } from './controllers/userController.js';

import {
  addBulkTasks,
  createSingleTask,
  deleteSingleTask,
  getAllTasks,
  getSingleTask,
  updateSingleTask,
} from './controllers/taskController.js';

import verifyToken from './middleware/verifyToken.js';

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(bodyParser.json());

const PORT = 1337;

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database');

  // Create the "todo" db if it doesn't exist
  db.query(
    `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'todo'}`,
    (err) => {
      if (err) {
        console.error('Error creating database: ' + err.message);
        return;
      }
    }
  );
  // Use the db
  db.query(`USE ${process.env.DB_NAME || 'todo'}`, (err) => {
    if (err) {
      console.error('Error selecting database: ' + err.message);
      return;
    }
    console.log('Using database "todo"');
  });

  // Create users table if it doesn't exists
  db.query(createUsersTableQuery, (err) => {
    if (err) {
      console.error('Error creating users table: ' + err.message);
      return;
    }
  });

  // Create TaskList table if it doesn't exists
  db.query(createTaskListTableQuery, (err) => {
    if (err) {
      console.error('Error creating users table: ' + err.message);
      return;
    }
  });
});

//AUTH ROUTES
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

//TASK ROUTES
app.get('/api/task', verifyToken, getAllTasks);
app.get('/api/task/:taskID', verifyToken, getSingleTask);

app.post('/api/task', verifyToken, createSingleTask);
app.post('/api/task/bulk_add', verifyToken, addBulkTasks);

app.put('/api/task/:taskID', verifyToken, updateSingleTask);
app.delete('/api/task/:taskID', verifyToken, deleteSingleTask);

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
