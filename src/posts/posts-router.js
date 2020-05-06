const express = require('express');
const PostsService = require('./posts-service');
const { requireAuth } = require('../middleware/jwt-auth');
const path = require('path');

const postsRouter = express.Router();
const jsonBodyParser = express.json();

postsRouter
  .route('/')
  .get(requireAuth, async (req, res, next) => {
    try {
      const posts = await PostsService.getPostsByZip(req.app.get('db'), req.user.zip);
      res.status(200).json(posts);
    } catch(error) {
      next(error)
    }
  })
  .post(requireAuth, jsonBodyParser, async (req, res, next) => {
    const { type, title, description } = req.body;
    const user_id = req.user.id;
    const newPost = {
      user_id,
      type,
      title,
      description,
    };
    if (!type) {
      return res.status(400).json({ error: { message: 'type required' } });
    }
    if (!title) {
      return res.status(400).json({ error: { message: 'title required' } });
    }
    if (!description) {
      return res
        .status(400)
        .json({ error: { message: 'description required' } });
    }
    if (description.length > 500) {
      return res
        .status(400)
        .json({
          error: { message: 'Description must not exceed 500 characters' },
        });
    }
    if (title.length > 60) {
      return res
        .status(400)
        .json({ error: { message: 'Title must not exceed 60 characters' } });
    }
    try {
      const post = await PostsService.insertPost(
        req.app.get('db'), 
        newPost
      );
      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `${post.id}`))
        .json(post);
    } catch (error) {
      next(error)
    }
  });

postsRouter
  .route('/:post_id')
  .patch(requireAuth, jsonBodyParser, async (req, res, next) => {
    const { title, description, resolved } = req.body

    if (!title) {
      return res.status(400).json({ error: { message: 'Title required' } });
    }
    if (!description) {
      return res
        .status(400)
        .json({ error: { message: 'Description required' } });
    }
    if (description.length > 500) {
      return res
        .status(400)
        .json({
          error: { message: 'Description must not exceed 500 characters' },
        });
    }
    if (title.length > 60) {
      return res
        .status(400)
        .json({ error: { message: 'Title must not exceed 60 characters' } });
    }

    try {
      const editedPost = await PostsService.editPost(
        req.app.get('db'),
        req.params.post_id,
        title,
        description,
        resolved
      )
      res.json(editedPost)
    } catch(error) {
      next(error)
    }
  })
  .delete(requireAuth, async (req, res, next) => {
  try {
    const post = await PostsService.deletePost(
      req.app.get('db'),
      req.params.post_id
    );
    if (!post) {
      return res.status(404).json({
        error: { message: 'Post does not exist' },
      });
    }
    res.status(204).end();
  } catch(error) {
    next(error)
  }
});

module.exports = postsRouter;
