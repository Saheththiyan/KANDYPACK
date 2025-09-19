// index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const customerController = require('./controllers/customerController');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from Node.js backend!');
});

const PORT = process.env.PORT;

// Call controller function
customerController.fetchCustomers();
