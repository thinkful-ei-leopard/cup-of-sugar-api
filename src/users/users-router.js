const express = require('express')
const UsersService = require('./users-service')
const { requireAuth } = require('../middleware/jwt-auth')
const path = require('path')

const usersRouter = express.Router()
const jsonBodyParser = express.json()

usersRouter
    .route('/:zip')
    .get(requireAuth, async (req, res, next) => {
        try {
        const allUsers = await UsersService.getAllUsers(req.app.get('db'))
            return res
                .status(200)
                .json(allUsers)
        }
        catch {next}
    })

  usersRouter
  .post('/', jsonBodyParser, async (req, res, next) => {
    const { password, username, name, email, zip, imgSrc, imgAlt } = req.body

    for (const field of ['name', 'username', 'password', 'email', 'zip', 'imgSrc', 'imgAlt'])
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`
        })
    if(zip.length !== 5) {
      return res.status(400).json({
        error: 'Zip code must be 5 digits'
      })
    }

    try {
      const passwordError = UsersService.validatePassword(password)

      if (passwordError)
        return res.status(400).json({ error: passwordError })

      const hasUserWithUserName = await UsersService.hasUserWithUserName(
        req.app.get('db'),
        username
      )

      if (hasUserWithUserName)
        return res.status(400).json({ error: `Username already taken` })

      const hashedPassword = await  UsersService.hashPassword(password)

      const newUser = {
        user_name: username,
        password: hashedPassword,
        name,
        email, 
        zip,
        admin_status: false,
        img_src: imgSrc,
        img_alt: imgAlt
      }

      const user = await UsersService.insertUser(
        req.app.get('db'),
        newUser
      )

      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${user.id}`))
        .json(UsersService.serializeUser(user))
    } catch(error) {
      next(error)
    }
  })

usersRouter
    .route('/user/:user_id')
    .get(requireAuth, async (req, res, next) => {
        const user = await UsersService.getById(req.app.get('db'), req.user.id)
            return res
                .status(200)
                .json(user)
    })

module.exports = usersRouter;