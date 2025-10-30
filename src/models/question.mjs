import mongoose from 'mongoose';

const Schema = new mongoose.Schema({
  poll: { type: mongoose.Schema.Types.ObjectId, ref: 'Poll', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, {
  collection: 'questions',
  minimize: false,
  versionKey: false
}).set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  }
});

export default Schema;
