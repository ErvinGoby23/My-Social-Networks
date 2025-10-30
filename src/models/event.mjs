import mongoose from 'mongoose';

const Schema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: { type: String, required: true },
  coverPhoto: { type: String },
  isPrivate: { type: Boolean, default: false },
  organizers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
  collection: 'events',
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
