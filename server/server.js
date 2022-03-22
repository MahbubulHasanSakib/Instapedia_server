const express=require('express')
const mongoose=require('mongoose')
const path = require('path');
const dotenv=require('dotenv')
const cors=require('cors')
const postRoutes=require('./routes/postRoutes')
const userRoutes=require('./routes/userRoutes')
const messageRoutes=require('./routes/messageRoutes')

dotenv.config()

const app=express()
const socket=require('socket.io')
app.use(express.static(path.join(__dirname,'/public')));
app.use(express.json())


mongoose.connect(process.env.MONGOURI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(()=>console.log('mongoose is connected'))
.catch((err)=>console.log(err))

app.use(cors())

app.use('/api/posts',postRoutes)
app.use('/api/users',userRoutes)
app.use('/api/messages',messageRoutes)

const PORT=process.env.PORT||5000
const server=app.listen(PORT,(err)=>
{
    if(err) console.log(err)
    else console.log(`Server is runnning at port ${PORT}`)
})

const io=socket(server,{
    cors:{
        origin:'http://localhost:3000',
        credentials:'true'
    }
})

global.onlineUsers=new Map()

io.on("connection",(socket)=>{
    global.chatSocket=socket
    socket.on("add-user",(userId)=>{
        onlineUsers.set(userId,socket.id)
    })

    socket.on("send-msg",(data)=>{
        const sendUserSocket=onlineUsers.get(data.to)
        if(sendUserSocket)
        {
            console.log("receive")
            socket.to(sendUserSocket).emit('msg-receive',data.message)
        }
    })
})