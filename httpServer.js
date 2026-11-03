// Part A: HTTP Module and Server Creation (no Express.js)
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const PORT = 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// In-memory array of employee tasks (no database)
const tasks = [
  { id: 1, taskName: 'Develop Login Page', assignedTo: 'Rahul Sharma', status: 'Pending' },
  { id: 2, taskName: 'Design Database Schema', assignedTo: 'Priya Singh', status: 'In Progress' },
  { id: 3, taskName: 'Write Unit Tests', assignedTo: 'Amit Kumar', status: 'Completed' }
];

// Helper to send JSON responses
const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
};

// Helper to send HTML responses
const sendHtml = (res, statusCode, html) => {
  res.writeHead(statusCode, { 'Content-Type': 'text/html' });
  res.end(html);
};

const server = http.createServer((req, res) => {
  const { method } = req;
  const url = req.url.split('?')[0];

  // A2 + A3: Routing and HTTP methods
  if (url === '/' && method === 'GET') {
    sendHtml(res, 200, '<h1>Welcome to the Employee Task Management Application</h1>');

  } else if (url === '/tasks' && method === 'GET') {
    sendJson(res, 200, tasks);

  } else if (url === '/about' && method === 'GET') {
    sendHtml(
      res,
      200,
      '<h1>About</h1><p>Employee Task Management application built with the Node.js HTTP module. ' +
        'It lets you view employee tasks and add new tasks.</p>'
    );

  } else if (url === '/home' && method === 'GET') {
    // A4: Static file serving using the FS module
    const filePath = path.join(__dirname, 'public', 'index.html');
    fs.readFile(filePath, (err, content) => {
      if (err) {
        sendHtml(res, 500, '<h1>500 - Error reading file</h1>');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });

  } else if (url === '/add-task' && method === 'POST') {
    // A3: Accept task details in JSON format
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      let task;
      try {
        task = JSON.parse(body);
      } catch (error) {
        sendJson(res, 400, { error: 'Invalid JSON format' });
        return;
      }

      // A5: Validate required task details
      const { id, taskName, assignedTo, status } = task;
      if (!id || !taskName || !assignedTo || !status) {
        sendJson(res, 400, { error: 'id, taskName, assignedTo and status are required' });
        return;
      }
      if (tasks.some((t) => t.id === id)) {
        sendJson(res, 409, { error: `Task with id ${id} already exists` });
        return;
      }

      const newTask = { id, taskName, assignedTo, status };
      tasks.push(newTask);
      sendJson(res, 201, { message: 'Task added successfully', task: newTask });
    });

  } else if (['/', '/tasks', '/about', '/home', '/add-task'].includes(url)) {
    // Valid route but unsupported method
    sendJson(res, 405, { error: `Method ${method} not allowed on ${url}` });

  } else {
    // A5: 404 for invalid routes
    sendHtml(res, 404, '<h1>404 - Page Not Found</h1>');
  }
});

server.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}`);
});
