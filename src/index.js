const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const user = users.find(user => user.username === username)

  if (!user) {
    return response.status(404).json({error: "User Not Found"})
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;

  const UserExists = users.some((user) => user.username === username);

  if (UserExists) {
    return response.status(400).json({ error: "User already exists!"})
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  });

  return response.status(201).json(users[users.length - 1])
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers;

  const user = users.find(user => user.username === username)

  response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers;
  const {title, deadline} = request.body;

  const user = users.find(user => user.username === username)

  user.todos.push({
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  })

  response.status(201).json(user.todos[user.todos.length - 1])
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers;
  const {id} = request.params
  const {title, deadline} = request.body;
  const user = users.find(user => user.username === username)
  const todo = user.todos.find(todo => todo.id === id)

  if(!todo){
    return response.status(404).json({ error: "Todo Not Found"})
  }

  todo.title = title;
  todo.deadline = deadline;

  response.status(200).json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers;
  const {id, done} = request.params
  const user = users.find(user => user.username === username)
  const todo = user.todos.find(todo => todo.id === id)

  if(!todo){
    return response.status(404).json({ error: "Todo Not Found"})
  }

  todo.done = true;

  response.status(200).json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {username} = request.headers;
  const {id} = request.params
  const user = users.find(user => user.username === username)
  const todo = user.todos.find(todo => todo.id === id)

  if(!todo){
    return response.status(404).json({ error: "Todo Not Found"})
  }

  user.todos.splice(todo, 1)

  response.status(204).send()
});

module.exports = app;