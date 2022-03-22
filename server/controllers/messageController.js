const Message=require('../models/message')
const asyncHandler = require('express-async-handler')
const getMessages=asyncHandler(async(req,res)=>
{
    console.log("ig")
    console.log(req.params)
    const from =req.params.sid;
    const to=req.params.rid
    console.log(from +" "+to)
    try {
       const messages=await Message.find({
           users:{
               $all:[from,to]
           }
       }).sort({updatedAt:1})
       
       const projectMessages=messages.map((msg)=>{
           return {
               fromSelf:msg.sender.toString()===from,
               message:msg.message.text
           }
       })
      res.send(projectMessages)
    } catch (error) {
       return res.status(404).send('Server error '+error.message)
    }
})

const sendMessage=asyncHandler(async(req,res)=>
{
    const sid=req.params.sid;
    const rid=req.params.rid;
    const msg=req.body.message;
    const senderUser=req.body.sender;
    const receiver=req.body.receiver;
    try {
       
        const newMessage= new Message({
            users:[sid,rid],
            senderUserName:senderUser,
            receiverUserName:receiver,
            message:{
                text:msg
            },
            sender:sid
        })
        await newMessage.save()
        .then(msg => {
            console.log(msg)
        })
        .catch(err => {
            return res.status(401).send('Server error' + err);
        })
    } catch (error) {
       return res.status(404).send('Server error')
    }
})
 module.exports = {getMessages,sendMessage}
 