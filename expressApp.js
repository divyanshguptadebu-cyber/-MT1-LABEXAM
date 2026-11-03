// Part B: Employee Task Management REST API using Express.js
import express from 'express';

const app = express();
const PORT = 4000;

app.use(express.json());

// Sample employee tasks (in-memory array, no database)
let tasks = [
  { id: 1, taskName: 'Develop Login Page', assignedTo: 'Rahul Sharma', status: 'Pending', priority: 'High' },
  { id: 2, taskName: 'Design Database Schema', assignedTo: 'Priya Singh', status: 'In Progress', priority: 'Medium' },
  { id: 3, taskName: 'Write Unit Tests', assignedTo: 'Amit Kumar', status: 'Completed', priority: 'Low' }
];

const findTask = (id) => tasks.find((task) => task.id === id);

// GET /tasks - retrieve all tasks
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// GET /tasks/:id - retrieve a task by ID
app.get('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = findTask(id);
  if (!task) {
    return res.status(404).json({ error: `Task with id ${req.params.id} not found` });
  }
  res.json(task);
});

// POST /tasks - add a new task
app.post('/tasks', (req, res) => {
  const { id, taskName, assignedTo, status, priority } = req.body || {};

  if (!id || !taskName || !assignedTo || !status || !priority) {
    return res
      .status(400)
      .json({ error: 'id, taskName, assignedTo, status and priority are required' });
  }
  if (findTask(id)) {
    return res.status(409).json({ error: `Task with id ${id} already exists` });
  }

  const newTask = { id, taskName, assignedTo, status, priority };
  tasks.push(newTask);
  res.status(201).json({ message: 'Task added successfully', task: newTask });
});

// PUT /tasks/:id - update task details
app.put('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = findTask(id);
  if (!task) {
    return res.status(404).json({ error: `Task with id ${req.params.id} not found` });
  }

  const { taskName, assignedTo, status, priority } = req.body || {};
  if (!taskName && !assignedTo && !status && !priority) {
    return res.status(400).json({ error: 'Provide at least one field to update' });
  }

  if (taskName) task.taskName = taskName;
  if (assignedTo) task.assignedTo = assignedTo;
  if (status) task.status = status;
  if (priority) task.priority = priority;

  res.json({ message: 'Task updated successfully', task });
});

// DELETE /tasks/:id - delete a task
app.delete('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = findTask(id);
  if (!task) {
    return res.status(404).json({ error: `Task with id ${req.params.id} not found` });
  }

  tasks = tasks.filter((t) => t.id !== id);
  res.json({ message: 'Task deleted successfully', task });
});

// Handle invalid JSON bodies
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({ error: 'Invalid JSON format' });
  }
  next(err);
});

// Handle invalid routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Express Server running at http://localhost:${PORT}`);
});
