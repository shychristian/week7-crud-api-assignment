require('dotenv').config()
const express = require('express');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3000;
const logRequest = require('./middlewares/logger.js');
const validateTodo = require('./middlewares/validator.js');
const errorHandler = require('./middlewares/errorHandler.js');
const validatePatch = require('./middlewares/validatePatch.js');
app.use(express.json()); // Parse JSON bodies

const corsOptions = {
  origin: 'http://example.com',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

app.use(logRequest); // Use the logger middleware for all routes

let todos = [
  { id: 1, task: 'Learn Node.js', completed: false },
  { id: 2, task: 'Build CRUD API', completed: false },
  { id: 3, task: 'Test API', completed: true },
  { id: 4, task: 'Deploy API', completed: true },
];

// GET All – Read
app.get('/todos', (req, res) => {
  res.status(200).json(todos); // Send array as JSON
});

// POST New – Create with Validation - week 3 assignment
app.post('/todos', validateTodo, (req, res, next) => {
  try {
    const { task } = req.body;
  if (!task) {
    return res.status(400).json({ error: 'Task is required' });
  }
  const newTodo = { id: todos.length + 1, task, completed: false };
  todos.push(newTodo);
  res.status(201).json(newTodo);
  } catch (error) {
    next(error);
  }
});

// PATCH Update – Partial
app.patch('/todos/:id', validatePatch, (req, res, next) => {
 try {
   const todo = todos.find((t) => t.id === parseInt(req.params.id)); // Array.find()
  if (!todo) return res.status(404).json({ message: 'Todo not found' });
  Object.assign(todo, req.body); // Merge: e.g., {completed: true}
  res.status(200).json(todo);
 } catch (error) {
  next(error);
 }
});

// DELETE Remove
app.delete('/todos/:id', (req, res, next) => {
 try {
   const id = parseInt(req.params.id);
  const initialLength = todos.length;
  todos = todos.filter((t) => t.id !== id); // Array.filter() – non-destructive
  if (todos.length === initialLength)
    return res.status(404).json({ error: 'Not found' });
  res.status(204).send(); // Silent success
 } catch (error) {
  next(error);
 }
});

app.get('/todos/completed', (req, res, next) => {
 try {
   const completed = todos.filter((t) => t.completed);
  res.status(200).json(completed); // Custom Read!
 } catch (error) {
  next(error);
 }
});

// Get /todos/active (filter !completed) – Read- Week 3 assignment
app.get('/todos/active', (req, res, next) => {
  try {
      const activeTodos = todos.filter(t => !t.completed);
    res.status(200).json(activeTodos); // Send the list of active todos as JSON response
  } catch (error) {
    next(error);
  }
});

// Get by ID – Read- Week 3 assignment
app.get('/todos/:id', (req, res, next) => {
 try {
  const id = parseInt(req.params.id);
  if (isNaN(id)){
    throw new Error('Invalid ID');
  }

  const todo = todos.find((t) => t.id === id);
  if (!todo) return res.status(404).json({ message: 'Todo not found' });
  res.status(200).json(todo);
 } catch (error) {
  next(error);
 }
});

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server on port ${PORT}`));
