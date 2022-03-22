const User = require('../models/user')
const Post = require('../models/post')
const Follow = require('../models/follow')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')


const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        res.status(401).send('This email is not registered');
    }
    else {
        const isMatched = await bcrypt.compare(password, user.password);
        if (isMatched) {
            const generatedToken = jwt.sign({ id: user._id }, process.env.JWTSECRET, {
                expiresIn: '10d'
            })
           
            return res.json({
                _id: user._id,
                name: user.name,
                username:user.username,
                email: user.email,
                isAdmin: user.isAdmin,
                profilePic: user.profilePic,
                token: generatedToken
            })
        }
        else {
            return res.status(401).send('Email or password is wrong');
        }
    }

})
const register = async (req, res) => {
    const {username, name, email, password } = req.body;
    console.log(req.body)
    const user = await User.findOne({ email });
    if (user) {
        return res.status(401).send('Sorry,this user is already registered');
    }
    else {
        const isUsernameExists = await User.findOne({ username });
        console.log(isUsernameExists)
        if(isUsernameExists)
        return res.status(401).send('Sorry,this username is already taken.Try new one');
        else{
        const hashedPassword = await bcrypt.hash(password, 10);
        const newuser = new User({
            username,
            name,
            email,
            password: hashedPassword,
            isAdmin: false
        });
        await newuser.save()
            .then(user => {
                return res.send(user)
            })
            .catch(err => {
                return res.status(401).send('Server error' + err);
            });
        }
    }
}

const userProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
    if (user)
        return res.send(user)
    else {
        res.status(404).send('User not found')
    }

})

const getAllUsers=asyncHandler(async (req, res) => {
    try{
        const users=await User.find({}).sort({username:1})
        console.log(users)
        res.send(users)
    }
    catch(err){
        res.status(401).send('Server error')
    }
})

const showProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
    if (user) {
        const isFollowed = await Follow.findOne({ followerId: req.user._id, followedId: user._id })
        const his_posts=await Post.find({postedUserId:req.params.id}).sort({'createdAt': -1})
        if (isFollowed) {
            return res.send({
                _id: user._id,
                name: user.name,
                email: user.email,
                profilePic: user.profilePic,
                total_followers: user.total_followers,
                total_followings: user.total_followings,
                number_of_posts: user.number_of_posts,
                username: user.username,
                bio: user.bio,
                website: user.website,
                his_posts:his_posts,
                actionType: 'followed'
            })
        }
        else {
            return res.send({
                _id: user._id,
                name: user.name,
                email: user.email,
                profilePic: user.profilePic,
                total_followers: user.total_followers,
                total_followings: user.total_followings,
                number_of_posts: user.number_of_posts,
                username: user.username,
                bio: user.bio,
                website: user.website,
                his_posts:his_posts,
                actionType: 'unfollowed'
            })
        }
    }
    else {
        return res.status(404).send('User not found')
    }

})

const updateProfile = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id)
    if (user) {
        if(req.body.username){
        console.log("isexists")
        const isUsernameExists = await User.findOne({ username:req.body.username });
        console.log(isUsernameExists)
        if(isUsernameExists)
        return res.status(401).send('Sorry,this username is already taken.Try new one');
        }
        console.log(req.file)
        let imagePath = '';
        if (req.file)
            imagePath = String('/' + req.file.destination.split('/').slice(1) + '/' + req.file.filename);
        user.name = req.body.name || user.name
        user.password = user.password
        user.isAdmin = user.isAdmin
        user.email = user.email
        if (user.username || req.body.username)
            user.username = req.body.username || user.username
        if (user.profilePic || req.body.profilePic)
            user.profilePic = imagePath || user.profilePic
        if (user.website || req.body.website)
            user.website = req.body.website || user.website
        if (user.bio || req.body.bio)
            user.bio = req.body.bio || user.bio
        user.email = req.body.email || user.email
        if (user.phone || req.body.phone)
            user.phone = req.body.phone || user.phone
        if (user.gender || req.body.gender)
            user.gender = req.body.gender || user.gender
        /*if(req.body.password)
        {
            user.password=await bcrypt.hash(req.body.password,10);
        }*/
        if (req.file) {
            const findUserPosts = await Post.find({ postedUserId: req.user._id })
            findUserPosts.map(async (post) => {
                post.postedUserImage = imagePath
                await post.save()
            })
        }
        if (req.body.username) {
            const findThisUserPosts = await Post.find({ postedUserId: req.user._id })
            findThisUserPosts.map(async (post) => {
                post.postedUsername = req.body.username;

                await post.save()
            })
            const findAllposts = await Post.find({})
            findAllposts.map(async (p) => {
                const isLiked = p.likedUsers.find(u => u.userId.toString() === req.user._id.toString())
                if (isLiked) {
                    isLiked.likedUserName = req.body.username;
                    await p.save()
                }
            })
            findAllposts.map(async (p) => {
                p.comments.map(async (com) => {
                    if (com.userId.toString() === req.user._id.toString()) {
                        com.commentedUsername = req.body.username;
                        await p.save()
                    }
                })

            })
        }
        const updatedUser = await user.save();
        res.send(updatedUser)
    }
    else {
        return res.status(404).send('User not found')
    }
})


const followUnfollow = asyncHandler(async (req, res) => {
    const findUser = await User.findById(req.params.id)
    if (findUser) {
        const isFollowed = await Follow.findOne({ followerId: req.user._id, followedId: findUser._id })
        if (isFollowed) {
            await Follow.deleteOne({ followerId: req.user._id, followedId: findUser._id })
                .then(async (f) => {
                    const followerUser = await User.findById(req.user._id);
                    if (followerUser) {
                        followerUser.total_followings = followerUser.total_followings - 1;
                        await followerUser.save()
                            .then((u) => console.log(u))
                            .catch((err) => console.log(err))
                    }
                    else res.status(401).send('User not found')

                    const fUser = await User.findById(findUser._id);
                    if (fUser) {
                        fUser.total_followers = fUser.total_followers - 1;
                        await fUser.save()
                            .then((u) => {
                                return res.send(
                                    {
                                        _id: u._id,
                                        name: u.name,
                                        email: u.email,
                                        profilePic: u.profilePic,
                                        total_followers: u.total_followers,
                                        total_followings: u.total_followings,
                                        number_of_posts: u.number_of_posts,
                                        username: u.username,
                                        bio: u.bio,
                                        website: u.website,
                                        actionType: 'unfollowed'
                                    }
                                )
                            })
                            .catch((err) => console.log(err))
                    }
                    else res.status(401).send('User not found')

                })
                .catch(err => {
                    return res.status(401).send('Server error');
                });
        }
        else {
            const newFollow = new Follow({
                followerId: req.user._id,
                followerName: req.user.name,
                followerUsername: req.user.username,
                followedId: findUser._id,
                followedName: findUser.name,
                followedUsername: findUser.username
            });
            await newFollow.save()
                .then(async (f) => {
                    const followerUser = await User.findById(req.user._id);
                    if (followerUser) {
                        followerUser.total_followings = followerUser.total_followings + 1;
                        await followerUser.save()
                            .then((u) => console.log(u))
                            .catch((err) => console.log(err))
                    }
                    else res.status(401).send('User not found')

                    const fUser = await User.findById(findUser._id);
                    if (fUser) {
                        fUser.total_followers = fUser.total_followers + 1;
                        await fUser.save()
                            .then((u) => {
                                return res.send(
                                    {
                                        _id: u._id,
                                        name: u.name,
                                        email: u.email,
                                        profilePic: u.profilePic,
                                        total_followers: u.total_followers,
                                        total_followings: u.total_followings,
                                        number_of_posts: u.number_of_posts,
                                        username: u.username,
                                        bio: u.bio,
                                        website: u.website,
                                        actionType: 'followed'
                                    }
                                )
                            })
                            .catch((err) => console.log(err))
                    }
                    else res.status(401).send('User not found')
                })
                .catch(err => {
                    return res.status(401).send('Server error');
                });
        }
    }
    else return res.status(404).send('User not found')
})

const isFollowed = asyncHandler(async (req, res) => {

    console.log(req.user._id)
    const findUser = await User.findById(req.params.id)
    if (findUser) {
        const isFollowed = await Follow.findOne({ followerId: req.user._id, followedId: findUser._id })
        console.log("isfollowed:");
        console.log(isFollowed)
        return res.send(isFollowed)
    }
    else return res.status(404).send('User not found')
})


const getFollowers=asyncHandler(async (req, res) => {
    const findUser = await User.findById(req.params.id)
    if (findUser) {
        const followers = await Follow.find({followedId:req.params.id })
        return res.send(followers)
    }
    else return res.status(404).send('User not found')
})

const getFollowings=asyncHandler(async (req, res) => {
    const findUser = await User.findById(req.params.id)
    if (findUser) {
        const followings = await Follow.find({followerId:req.params.id })
        return res.send(followings)
    }
    else return res.status(404).send('User not found')
})

module.exports = {
    register, login, userProfile, updateProfile, showProfile, followUnfollow,
    isFollowed,getAllUsers,getFollowers,getFollowings
}