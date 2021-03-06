const express = require('express')
const ThreadsService = require('./threads-service')
const { requireAuth } = require('../middleware/jwt-auth')
const path = require('path')

const threadsRouter = express.Router()
const jsonBodyParser = express.json()

threadsRouter
    .route('/')
    .get(requireAuth, async (req, res, next) => {
        try {
          const threads1 = await ThreadsService.getByUserId1(req.app.get('db'), req.user.id);
          const threads2 = await ThreadsService.getByUserId2(req.app.get('db'), req.user.id);
          const threads = threads1.concat(threads2);
          res.status(200).json(threads);
        } catch(error) {
          next(error)
        }
      })
    .post(requireAuth, jsonBodyParser, async (req, res, next) => {
      const user_id1 = req.user.id;
      const { name1, user_name1, user_id2, name2, user_name2, img_src1, img_alt1, img_src2, img_alt2, } = req.body;
      const newThread = {
        user_id1,
        name1,
        user_name1,
        user_id2, 
        name2,
        user_name2,
        img_src1,
        img_alt1,
        img_src2,
        img_alt2,
      };
      if (user_id1 === user_id2) {
        return res.status(400).json({ error: { message: 'User cannot message themselves' } });
      }
      try {
        const thread = await ThreadsService.insertThread(
          req.app.get('db'), 
          newThread
        );
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `${thread.id}`))
          .json(thread);
      } catch (error) {
        next(error);
      }
    });
threadsRouter
  .route('/:thread_id')
  .delete(requireAuth, async (req, res, next) => {
  try {
    const thread = await ThreadsService.deleteThread(
      req.app.get('db'),
      req.params.thread_id
    );
    if (!thread) {
      return res.status(404).json({
        error: { message: 'Thread does not exist' },
      });
    }
    res.status(204).end();
  } catch(error) {
    next(error);
  }
})
.get(requireAuth, async (req, res, next) => {
  try{
    const thread = await ThreadsService.getById(req.app.get('db'), req.params.thread_id)
    res.status(200).json(thread)
  } catch(error) {
    next(error)
  }
});

    module.exports = threadsRouter