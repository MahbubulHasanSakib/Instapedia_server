const Post = require('../models/post')
const asyncHandler = require('express-async-handler')
const User = require('../models/user')
const Follow=require('../models/follow')

const getPosts = asyncHandler(async (req, res) => {
    
     try {
         const posts = await Post.find({}).sort({'createdAt': -1})
         const filterPosts=[]
        for(let i=0;i<posts.length;i++){
             if(posts[i].postedUserId.toString()===req.user._id.toString())
             filterPosts.push(posts[i])
             else{
              const isFollowedPostedUser=await Follow.findOne({followerId:req.user._id.toString(),followedId:posts[i].postedUserId.toString()})
              if(isFollowedPostedUser)
              filterPosts.push(posts[i])
             }
             
         }
         return res.send(filterPosts)
     } catch (error) {
        return res.status(404).send('Server error')
     }
 })

 const getSingleUserPosts = asyncHandler(async (req, res) => {
    
    try {
        const posts = await Post.find({postedUserId:req.params.uid}).sort({'createdAt': -1})
        return res.send(posts)
    } catch (error) {
       return res.status(404).send('Server error')
    }
})

 const postComments=asyncHandler(async(req,res)=>{
     try {
         console.log(req.body)
         const post=await Post.findById(req.params.id)
         const tempComments=post.comments;
         tempComments.push({userId:req.user._id,commentedUsername:req.user.username,comment:req.body.comment})
         post.comments=tempComments;
         const updatedPost=await post.save();
         return res.send(updatedPost)
     } catch (error) {
        return res.status(404).send('Server error')
     }
 })

const createPost=asyncHandler(async(req,res)=>
{
    const findUser=await User.findById(req.user._id)
    const imagePath = String('/' + req.file.destination.split('/').slice(1) + '/' + req.file.filename);
    console.log(imagePath)
    const newPost=new Post({
    postedUsername:req.user.username,
    postedUser:req.user.name,
    postedUserId:req.user._id,
    postedUserImage:findUser.profilePic,
    image:imagePath,
    description:req.body.postDescription
   })
   await newPost.save()
   .then(async(p)=>{
       const fUser= await User.findById(req.user._id);
       if(fUser)
       {
        fUser.number_of_posts=fUser.number_of_posts+1;
        await fUser.save()
        .then((u)=>console.log(u))
        .catch((err)=>console.log(err))
       }
       else res.status(401).send('User not found')
   })
   .catch((err)=>console.log(err))
   const posts = await Post.find({}).sort({'createdAt': -1})
   const filterPosts=[]
  for(let i=0;i<posts.length;i++){
       if(posts[i].postedUserId.toString()===req.user._id.toString())
       filterPosts.push(posts[i])
       else{
        const isFollowedPostedUser=await Follow.findOne({followerId:req.user._id.toString(),followedId:posts[i].postedUserId.toString()})
        if(isFollowedPostedUser)
        filterPosts.push(posts[i])
       }
       
   }
   return res.send(filterPosts)
})


const likePost=asyncHandler(async(req,res)=>
{
    try {
        const post=await Post.findById(req.body.pid)
        const isLiked=post.likedUsers.find(likedUser=>likedUser.userId.toString()===req.user._id.toString())
        if(isLiked)
        {
           const tempLikedUsers=post.likedUsers.filter((u)=>u.userId.toString()!==req.user._id.toString())
           post.likedUsers=tempLikedUsers;
           post.totalLikes=post.totalLikes-1;
           const updatedPost=await post.save();
           return res.send(updatedPost)
        }
        else
        {
            post.likedUsers.push({userId:req.user._id,likedUserName:req.user.username})
            post.totalLikes=post.totalLikes+1;
            const updatedPost=await post.save();
            return res.send(updatedPost)
        }
    } catch (error) {
       return res.status(404).send('Server error')
    }
})
 module.exports = {getPosts,postComments,createPost,likePost,getSingleUserPosts}
 