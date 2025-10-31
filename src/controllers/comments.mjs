import CommentModel from '../models/comment.mjs';

const Comments = class Comments {
  constructor(app, connect) {
    this.app = app;
    this.CommentModel = connect.model('Comment', CommentModel);
    this.run();
  }

  addComment() {
    this.app.post('/photo/:id/comment', async (req, res) => {
      try {
        const { author, content } = req.body;

        const comment = new this.CommentModel({
          photo: req.params.id,
          author,
          content
        });

        const saved = await comment.save();
        res.status(201).json(saved);
      } catch (err) {
        if (err.name === 'ValidationError') {
          const errors = Object.values(err.errors).map(e => e.message);
          return res.status(400).json({
            code: 400,
            message: 'Validation Error',
            errors
          });
        }

        console.error(`[ERROR] addComment -> ${err}`);
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }

  run() {
    this.addComment();
  }
};

export default Comments;
