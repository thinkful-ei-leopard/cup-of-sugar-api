const express = require('express')
const UsersService = require('./users-service')
const { requireAuth } = require('../middleware/jwt-auth')
const path = require('path')
const xss = require('xss')

const usersRouter = express.Router()
const jsonBodyParser = express.json()

const serializeUser = user => ({
  id: user.id,
  name: xss(user.name),
  user_name: xss(user.user_name),
  zip: user.zip,
  img_src: xss(user.img_src),
  img_alt: xss(user.img_alt)
})

usersRouter
    .route('/zip/:zip')
    .get(requireAuth, async (req, res, next) => {
        try {
        const usersInZip = await UsersService.getUsersByZip(req.app.get('db'), req.params.zip)
            return res
                .status(200)
                .json(usersInZip.map(serializeUser))
        }
        catch {next}
    })

  usersRouter
  .post('/', jsonBodyParser, async (req, res, next) => {
    const { password, username, name, email, zip, img_src, img_alt } = req.body
    let usernames = await UsersService.getAllUsersUsernames(req.app.get('db'))
    usernames.forEach(user_name => {
      if (user_name === username) {
        return res.status(400).send({error: {message: 'Username already taken'}})
      }
    })
    if(zip.length !== 5) {
      return res.status(400).json({
        error: 'Zip code must be 5 digits'
      })
    }
    if(name.length > 20) {
      return res.status(400).json({
        error: 'Name cannot exceed 20 characters'
      })
    }
    if(username.length > 20) {
      return res.status(400).json({
        error: 'User Name cannot exceed 20 characters'
      })
    }
    for (const field of ['name', 'username', 'password', 'email', 'zip', 'img_alt'])
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`
        })

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
      const user = await UsersService.getById(req.app.get('db'), req.params.user_id)
          return res
              .status(200)
              .json(serializeUser(user))
  })

module.exports = usersRouter;