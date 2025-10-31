import mongoose from 'mongoose';
const { isValidObjectId } = mongoose;

const Schema = new mongoose.Schema({
  thread: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Thread', 
    required: true,
    validate: v => isValidObjectId(v)
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    validate: v => isValidObjectId(v)
  },
  content: { type: String, required: true, minlength: 1, maxlength: 2000 },
  replyTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Message', 
    default: null,
    validate: v => v === null || isValidObjectId(v)
  },
  createdAt: { type: Date, default: Date.now }
}, {
  collection: 'messages',
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
