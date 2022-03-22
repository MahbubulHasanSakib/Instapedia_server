const express=require('express')
const router=express.Router()
const path=require('path')
const {isAuth}=require('../middlewares/authMiddleware')
const {login,register,userProfile,getAllUsers,updateProfile,showProfile
    ,isFollowed,followUnfollow,getFollowers,getFollowings}=require('../controllers/userController')
const multer=require('multer')
const { v4: uuidv4 } = require('uuid')

const storage=multer.diskStorage({
    destination:(req,file,callback)=>{
        callback(null,"public/uploads")
    },
    filename:(req,file,callback)=>
    {
        callback(null, uuidv4() + '-' + Date.now()+path.extname(file.originalname))
    }
})

const upload=multer({storage:storage});

router.get('/',isAuth,getAllUsers)
router.post('/login',login)
router.post('/register',register)
router.get('/userProfile',isAuth,userProfile)
router.get('/showProfile/:id',isAuth,showProfile)
router.get('/followUnfollow/:id',isAuth,followUnfollow)
router.get('/getFollowers/:id',isAuth,getFollowers)
router.get('/getFollowings/:id',isAuth,getFollowings)
router.get('/isFollowed/:id',isAuth,isFollowed)
router.post('/updateProfile',isAuth,upload.single('profilePic'),updateProfile)
module.exports=router