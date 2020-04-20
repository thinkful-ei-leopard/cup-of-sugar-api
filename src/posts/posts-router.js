const express = require('express')
const PostsService = require('./posts-service')
const { requireAuth } = require('../middleware/jwt-auth')
const path = require('path')

const usersRouter = express.Router()
const jsonBodyParser = express.json()