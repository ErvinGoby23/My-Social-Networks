import PollModel from '../models/poll.mjs';
import QuestionModel from '../models/question.mjs';
import AnswerModel from '../models/answer.mjs';
import VoteModel from '../models/vote.mjs';

const Polls = class Polls {
  constructor(app, connect) {
    this.app = app;
    this.PollModel = connect.model('Poll', PollModel);
    this.QuestionModel = connect.model('Question', QuestionModel);
    this.AnswerModel = connect.model('Answer', AnswerModel);
    this.VoteModel = connect.model('Vote', VoteModel);
    this.run();
  }

  createPoll() {
    this.app.post('/event/:id/poll', async (req, res) => {
      try {
        const { title, createdBy } = req.body;
        const poll = new this.PollModel({ event: req.params.id, title, createdBy });
        const saved = await poll.save();
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

  addQuestion() {
    this.app.post('/poll/:id/question', async (req, res) => {
      try {
        const question = new this.QuestionModel({ poll: req.params.id, text: req.body.text });
        const saved = await question.save();
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

  addAnswer() {
    this.app.post('/question/:id/answer', async (req, res) => {
      try {
        const answer = new this.AnswerModel({ question: req.params.id, text: req.body.text });
        const saved = await answer.save();
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

  addVote() {
    this.app.post('/question/:id/vote', async (req, res) => {
      try {
        const { user, selectedAnswer } = req.body;

        const existing = await this.VoteModel.findOne({ question: req.params.id, user });
        if (existing) {
          return res.status(400).json({ message: 'User has already voted on this question' });
        }

        const vote = new this.VoteModel({ question: req.params.id, user, selectedAnswer });
        const saved = await vote.save();
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

  getResults() {
    this.app.get('/poll/:id/results', async (req, res) => {
      try {
        const questions = await this.QuestionModel.find({ poll: req.params.id });
        const results = [];

        for (const q of questions) {
          const answers = await this.AnswerModel.find({ question: q.id });
          const stats = [];

          for (const a of answers) {
            const count = await this.VoteModel.countDocuments({ selectedAnswer: a.id });
            stats.push({ answer: a.text, votes: count });
          }

          results.push({ question: q.text, results: stats });
        }

        res.status(200).json(results);
      } catch (err) {
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }

  run() {
    this.createPoll();
    this.addQuestion();
    this.addAnswer();
    this.addVote();
    this.getResults();
  }
};

export default Polls;
