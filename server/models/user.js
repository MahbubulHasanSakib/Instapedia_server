const mongoose=require('mongoose')
const Schema=mongoose.Schema

const userSchema=new Schema({
name:{
    type:String,
    required:true
},
username:{type:String,unique:true,required:true},
website:{type:String},
bio:{type:String},
phone:{type:String},
gender:{type:String},
email:{
    type:String,
    required:true,
    unique:true
},
password:{
    type:String,
    required:true
},
profilePic:
{
    type:String,
    default:'/uploads/default_profile.png'
},
isAdmin:{
    type:Boolean,
    default:false
},
total_followers:{
    type:Number,
    default:0
},
total_followings:{
    type:Number,
    default:0
},
number_of_posts:{
    type:Number,
    default:0
},

},{timestamps:true})

const User=mongoose.model('user',userSchema)
module.exports=User