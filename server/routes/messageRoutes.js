const express=require('express')
const router=express.Router()
const {getMessages,sendMessage}=require('../controllers/messageController')
const {isAuth}=require('../middlewares/authMiddleware')

router.get('/:sid/:rid',isAuth,getMessages)
router.post('/send/:sid/:rid',isAuth,sendMessage);
module.exports=router