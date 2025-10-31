import UserModel from '../models/user.mjs';

const Users = class Users {
  constructor(app, connect) {
    this.app = app;
    this.UserModel = connect.model('User', UserModel);
    this.run();
  }

  create() {
    this.app.post('/user', async (req, res) => {
      try {
        const user = new this.UserModel(req.body);
        const savedUser = await user.save();
        res.status(201).json(savedUser);
      } catch (err) {
        console.error(`[ERROR] users/create -> ${err}`);

        if (err.name === 'ValidationError') {
          const errors = Object.values(err.errors).map(e => e.message);
          return res.status(400).json({ code: 400, message: 'Validation Error', errors });
        }

        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }


  getAll() {
    this.app.get('/users', async (req, res) => {
      try {
        const users = await this.UserModel.find();
        res.status(200).json(users);
      } catch (err) {
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }

  getById() {
    this.app.get('/user/:id', async (req, res) => {
      try {
        const user = await this.UserModel.findById(req.params.id);
        res.status(200).json(user || {});
      } catch (err) {
        res.status(404).json({ code: 404, message: 'User Not Found' });
      }
    });
  }

  deleteById() {
    this.app.delete('/user/:id', async (req, res) => {
      try {
        const deleted = await this.UserModel.findByIdAndDelete(req.params.id);
        res.status(200).json(deleted || {});
      } catch (err) {
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }

  run() {
    this.create();
    this.getAll();
    this.getById();
    this.deleteById();
  }
};

export default Users;
