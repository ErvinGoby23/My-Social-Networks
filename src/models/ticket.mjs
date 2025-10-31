import mongoose from "mongoose";
const { isValidObjectId } = mongoose;

const Schema = new mongoose.Schema({
  ticketType: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "TicketType", 
    required: true, 
    validate: v => isValidObjectId(v) 
  },
  firstName: { type: String, required: true, minlength: 2 },
  lastName: { type: String, required: true, minlength: 2 },
  address: { type: String, required: true, minlength: 5 },
  purchaseDate: { type: Date, default: Date.now }
}, {
  collection: "tickets",
  versionKey: false
}).set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  }
});

export default Schema;
