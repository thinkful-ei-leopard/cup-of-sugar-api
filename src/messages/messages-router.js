const express = require('express')
const MessagesService = require('./messages-service')
const { requireAuth } = require('../middleware/jwt-auth')
const path = require('path')

const messagesRouter = express.Router()
const jsonBodyParser = express.json()

messagesRouter
  .route('/')
  .get(requireAuth, async (req, res, next) => {
    try {
      const messages = await MessagesService.getAllMessages(req.app.get('db'));
      res
        .status(200)
        .json(messages);
    } catch (error) {
      next(error)
    }
  })

messagesRouter
    .route('/:thread_id')
    .get(requireAuth, async (req, res, next) => {
        try {
          const messages = await MessagesService.getByThread(req.app.get('db'), req.params.thread_id);
          res.status(200).json(messages);
        } catch(error) {
          next(error)
        }
      })
    .post(requireAuth, jsonBodyParser, async (req, res, next) => {
      const user_id = req.user.id;
      const thread_id = parseInt(req.params.thread_id);
      const content = req.body.newMessage;
      if(!content) {
        return res.status(400).send({error: {message: 'No message content'}})
      }
      const newMessage = {
        user_id,
        thread_id,
        content
      };
      try {
        const message = await MessagesService.insertMessage(
          req.app.get('db'), 
          newMessage
        );
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `${message.id}`))
          .json(message);
      } catch (error) {
        next(error);
      }
    })
messagesRouter
    .route('/message/:message_id')
    .delete(requireAuth, async (req, res, next) => {
      try {
        const message = await MessagesService.deleteMessage(
          req.app.get('db'),
          req.params.message_id
        );
        if (!message) {
          return res.status(404).json({
            error: { message: 'Message not found' },
          });
        }
        res.status(204).end();
      } catch(error) {
        next(error);
      }
    });

    module.exports = messagesRouter