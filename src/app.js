require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet=require('helmet');
const { NODE_ENV } = require('./config');
const authRouter = require('./auth/auth-router')
const usersRouter = require('./users/users-router')

const app= express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.get('/', (req, res) => {
     res
        .status(200)
        .send('Hello, world!')
});

app.use('/api/users', usersRouter)
app.use('/api/auth', authRouter)

app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
      response = { error: { message: 'server error' } }
    } else {
      console.error(error)
      response = { message: error.message, error }
    }
    res.status(500).json(response)
     })

module.exports = app;