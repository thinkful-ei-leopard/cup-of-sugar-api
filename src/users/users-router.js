const express = require('express')
const UsersService = require('./users-service')
const { requireAuth } = require('../middleware/jwt-auth')
const path = require('path')

const usersRouter = express.Router()
const jsonBodyParser = express.json()