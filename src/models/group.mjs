import mongoose from 'mongoose';

const Schema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  icon: { type: String },
  coverPhoto: { type: String },
  type: {
    type: String,
    enum: ['public', 'private', 'secret'],
    default: 'public'
  },
  allowPosts: { type: Boolean, default: true },
  allowEventCreation: { type: Boolean, default: false },
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
  collection: 'groups',
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
