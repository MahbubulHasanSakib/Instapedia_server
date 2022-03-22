const express=require('express')
const router=express.Router();
const path=require('path')
const {isAuth}=require('../middlewares/authMiddleware')
const {getPosts,postComments,createPost,likePost,getSingleUserPosts}=require('../controllers/postController')
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


router.get('/',isAuth,getPosts)
router.get('/:uid',isAuth,getSingleUserPosts)
router.post('/:id/comment',isAuth,postComments)
router.post('/create',isAuth,upload.single('postImg'),createPost)
router.post('/like',isAuth,likePost)


module.exports=router