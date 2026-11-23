require('dotenv').config()
const express = require('express');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3000;
const logRequest = require('./middlewares/logger.js');
const validateTodo = require('./middlewares/validator.js');
const errorHandler = require('./middlewares/errorHandler.js');
const validatePatch = require('./middlewares/validatePatch.js');
const Todo = require('./models/todo.models.js');
const connectDB = require('./database/db.js');

app.use(express.json()); // Parse JSON bodies

const corsOptions = {
  origin: 'http://example.com',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

connectDB();

app.use(cors(corsOptions));

app.use(logRequest); // Use the logger middleware for all routes

// GET All – Read
app.get('/todos', async (req, res) => {

const todos = await Todo.find({}); // Fetch all todos from the database
  res.status(200).json(todos); // Send array as JSON
});

// POST New – Create with Validation - week 3 assignment
app.post('/todos', validateTodo, async (req, res, next) => {
  try {
    const newTodo = new Todo(req.body);
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    next(error);
  }
});

// PATCH Update – Partial
app.patch('/todos/:id', validatePatch, async (req, res, next) => {
 try {
   const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true }); // Use Mongoose's findByIdAndUpdate method to fetch and update the todo by ID
  if (!todo) return res.status(404).json({ message: 'Todo not found' });
  res.status(200).json(todo);
 } catch (error) {
  next(error);
 }
});

// DELETE Remove
app.delete('/todos/:id',  async (req, res, next) => {
 try {
  const id = parseInt(req.params.id);
  const todo = await Todo.findByIdAndDelete(req.params.id); // Use Mongoose's findByIdAndDelete method to fetch and delete the todo by ID

  if (!todo) { 
    return res.status(404).json({ message: 'Todo not found' });
  }
  res.status(200).json({ message: `Todo ${req.params.id} deleted successfully` });
 } catch (error) {
  next(error);
 }
});

app.get('/todos/completed', async (req, res, next) => {
 try {
   const completed = await Todo.find({ completed: true });
  res.status(200).json(completed); // Custom Read!
 } catch (error) {
  next(error);
 }
});

// Get /todos/active (filter !completed) – Read- Week 3 assignment
app.get('/todos?completed=false', async (req, res, next) => {
  try {
      const activeTodos = await Todo.find({ completed: false });
    res.status(200).json(activeTodos); // Send the list of active todos as JSON response
  } catch (error) {
    next(error);
  }
});

// Get by ID – Read- Week 3 assignment
app.get('/todos/:id', async (req, res, next) => {
 try {
 
  const todo = await Todo.findById(req.params.id); // Use Mongoose's findById method to fetch the todo by ID
  if (!todo) return res.status(404).json({ message: 'Todo not found' });
  res.status(200).json(todo);
 } catch (error) {
  next(error);
 }
});

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server on port ${PORT}`));
