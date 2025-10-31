import ThreadModel from '../models/thread.mjs';
import MessageModel from '../models/message.mjs';

const Threads = class Threads {
  constructor(app, connect) {
    this.app = app;
    this.ThreadModel = connect.model('Thread', ThreadModel);
    this.MessageModel = connect.model('Message', MessageModel);
    this.run();
  }

  createThread() {
    this.app.post('/thread', async (req, res) => {
      try {
        const thread = new this.ThreadModel(req.body);
        const saved = await thread.save();
        res.status(201).json(saved);
      } catch (err) {
        if (err.name === 'ValidationError') {
          const errors = Object.values(err.errors).map(e => e.message);
          return res.status(400).json({ code: 400, message: 'Validation Error', errors });
        }
        res.status(400).json({ code: 400, message: 'Bad Request' });
      }
    });
  }

  getAllThreads() {
    this.app.get('/thread', async (req, res) => {
      try {
        const threads = await this.ThreadModel.find()
          .populate('group', 'name')
          .populate('event', 'name')
          .populate('createdBy', 'firstname lastname');
        res.status(200).json(threads);
      } catch (err) {
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }

  getMessagesByThread() {
    this.app.get('/thread/:id/messages', async (req, res) => {
      try {
        const messages = await this.MessageModel.find({ thread: req.params.id })
          .populate('author', 'firstname lastname')
          .populate('replyTo', 'content');
        res.status(200).json(messages);
      } catch (err) {
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }

  addMessage() {
    this.app.post('/thread/:id/message', async (req, res) => {
      try {
        const { author, content, replyTo } = req.body;
        const message = new this.MessageModel({
          thread: req.params.id,
          author,
          content,
          replyTo: replyTo || null
        });

        const savedMessage = await message.save();
        res.status(201).json(savedMessage);
      } catch (err) {
        if (err.name === 'ValidationError') {
          const errors = Object.values(err.errors).map(e => e.message);
          return res.status(400).json({ code: 400, message: 'Validation Error', errors });
        }
        res.status(400).json({ code: 400, message: 'Bad Request' });
      }
    });
  }

  deleteMessage() {
    this.app.delete('/message/:id', async (req, res) => {
      try {
        const deleted = await this.MessageModel.findByIdAndDelete(req.params.id);
        res.status(200).json(deleted || {});
      } catch (err) {
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }

  run() {
    this.createThread();
    this.getAllThreads();
    this.getMessagesByThread();
    this.addMessage();
    this.deleteMessage();
  }
};

export default Threads;
