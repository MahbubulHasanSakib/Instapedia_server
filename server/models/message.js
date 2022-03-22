const mongoose = require('mongoose')
const Schema = mongoose.Schema

const messageSchema = new Schema({
    users:[],
    senderUserName: { type: String },
    receiverUserName: { type: String},
    message:{
        text:{ type: String, required: true }
    },
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
}, { timestamps: true })

const Message = mongoose.model('message', messageSchema)
module.exports = Message