const mongoose = require('mongoose')
const Schema = mongoose.Schema

const followSchema = new Schema({
    followerId: { type: String, required: true },
    followerName: { type: String, required: true },
    followerUsername: { type: String, required: true },
    followedId: { type: String, required: true },
    followedName: { type: String, required: true },
    followedUsername: { type: String, required: true },
}, { timestamps: true })

const Follow = mongoose.model('follow', followSchema)
module.exports = Follow