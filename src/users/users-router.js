const express = require('express')
const UsersService = require('./users-service')
const { requireAuth } = require('../middleware/jwt-auth')
const path = require('path')

const usersRouter = express.Router()
const jsonBodyParser = express.json()

usersRouter
    .route('/')
    .get((req, res, next) => {
        UsersService.getAllUsers(req.app.get('db'))
            .then(users => {
                res
                    .status(200)
                    .json(users)
            })
            .catch(next)
    })

    .post(jsonBodyParser, (req, res, next) => {
        const { name, password, admin } = req.body
        const newUser = { name, password, admin }

        if(!newUser) {
            return res
                .status(400)
                .json({ error: {message: 'User required'}})
        }

        if(!name || !password) {
            return res 
                .status(400)
                .json({ error: {message: 'Name and password required'}})
        }
        UsersService.insertUser(req.app.get('db'), newUser)
            .then(user => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${user.id}`))
                    .json(user)
            })
    })

usersRouter
    .route('/user')
    .get(requireAuth, (req, res, next) => {
        UsersService.getById(req.app.get('db'), req.user.id)
        .then(user => {
            res
                .status(200)
                .json(user)
        })
    })

module.exports = usersRouter;