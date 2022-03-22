const mongoose=require('mongoose')
const Schema=mongoose.Schema

const postSchema=new Schema({
postedUser:{
    type:String,
    required:true
},
postedUsername:{
    type:String,
    required:true
},
postedUserId:{
    type:String,
    ref:'user'
},
postedUserImage:{
    type:String
},
image:{
    type:String,
    required:true
},
description:{
    type:String,
    required:true
},
likedUsers:[{
       userId:{type:String},
       likedUserName:{type:String}
   }],
totalLikes:{
    type:Number,
    default:0
},
comments:[{
    userId:{type:String},
    commentedUsername:{
        type:String,
    },
    comment:{
        type:String,
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
}],
postDate:{
    type:Date,
    default:Date.now
}
},{timestamps:true})

const Post=mongoose.model('post',postSchema)
module.exports=Post