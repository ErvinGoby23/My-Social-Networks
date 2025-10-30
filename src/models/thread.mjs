import mongoose from 'mongoose';

const Schema = new mongoose.Schema({
  title: { type: String, required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
}, {
  collection: 'threads',
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
