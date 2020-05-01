const express = require('express')
const UsersService = require('./users-service')
const { requireAuth } = require('../middleware/jwt-auth')
const path = require('path')

const usersRouter = express.Router()
const jsonBodyParser = express.json()

usersRouter
    .route('/zip/:zip')
    .get(requireAuth, async (req, res, next) => {
      console.log('accessed get by zip route')
        try {
        const usersInZip = await UsersService.getUsersByZip(req.app.get('db'), req.params.zip)
            return res
                .status(200)
                .json(usersInZip)
        }
        catch {next}
    })

  usersRouter
  .post('/', jsonBodyParser, async (req, res, next) => {
    const { password, username, name, email, zip, img_src, img_alt } = req.body

    for (const field of ['name', 'username', 'password', 'email', 'zip', 'img_alt'])
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
        img_src,
        img_alt,
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
  .route('/:user_id')
  .get(requireAuth, async (req, res, next) => {
    console.log(req.user)
      const user = await UsersService.getById(req.app.get('db'), req.params.user_id)
          return res
              .status(200)
              .json(user)
  })

module.exports = usersRouter;