const express=require('express')
const app=express();
const pm=require('path')
const cors=require('cors')
const User=require('./models/User')
const Post=require('./models/Posts')
const Comments=require('./models/Comments')
const cp=require('cookie-parser')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const mongoose=require('mongoose');
const multer=require('multer')
const upload=multer({dest:'./back/uploads'})
const fs=require('fs');
const { log, Console } = require('console');
app.use('/uploads', express.static(__dirname+'/uploads'));
mongoose.connect("mongodb+srv://Pratham_121001:goodvsbad@cluster0.eupfbsd.mongodb.net/?retryWrites=true&w=majority").then(()=>{
    console.log('connected')
}).catch((err)=>{
    console.log(err)
})
const hash=async (password)=>{
    try {
        const salt = await bcrypt.genSalt(10)
        return await bcrypt.hash(password, salt)
      } catch (error) {
        
      }
      return null
}
// app.use(cors())
// const corsOptions = {
//     origin: '*', // Change this to the specific origin(s) you want to allow
//     methods: 'GET,POST', // Specify the HTTP methods you want to allow
//     allowedHeaders: 'Content-Type,Authorization', // Specify the allowed headers
//   };
  
//   app.use(cors(corsOptions));
const corsOptions = {
    origin: 'http://localhost:3000', // Specify the exact origin you want to allow
    credentials: true, // Allow credentials like cookies to be sent
  };
  app.use(cors(corsOptions))
app.use(express.json())
app.use(cp())
app.post('/signup',async (req,res)=>{
    const {name,email,password}=req.body
    try{
        const exist=await User.findOne({email:email})
        if(exist){
            res.status(400).send("user exists")
        }
        else{
            const hashpass=await hash(password)
            const newuser=new User({
                name:name,
                email:email,
                password:hashpass
            })
            await newuser.save()
            res.send('added')
        }
    }
    catch(e){
        res.status(400).send("error")    
    }
    
})
app.get('/posts/:id',async (req,res)=>{
    try{
        const postpage=await Post.findById(req.params['id'])
        res.json(postpage)
    }
    catch(e){
        res.status(400).send("error")
    }
})
app.get('/posts',(req,res)=>{
    const {token}=req.cookies
    jwt.verify(token,'abc',{},(err,data)=>{
        if(err)res.status(400).json("error")
        res.json(data)
        
})
})
app.post('/login',async (req,res)=>{
    const {email,password}=req.body
    try{
        const exist=await User.findOne({email:email})
        if(exist){
            const cmp=await bcrypt.compare(password,exist.password)
            if(cmp){
                jwt.sign({exist},"abc",{},(err,token)=>{
                    if(err) throw err
                    res.cookie("token",token).json(exist)
                })
            }
            else{
                res.status(400).json("Wrong credential")
            }
        }
        else{
            res.status(400).json('No user')
        }
    }
    catch(e){
        res.status(400).json(e)   
    }
    
})
app.post('/upload',upload.single('file'),async (req,res)=>{
    const {originalname,path}=req.file;
    const parts=originalname.split('.')
    const ext=parts[parts.length-1]
    const newpath=path+'.'+ext
    const end=path.split("\\")
    fs.renameSync(path,newpath)
    const {token}=req.cookies
    jwt.verify(token,'abc',{},async (err,data)=>{
        if(err)res.status(400).send("error")
        else {
    const {title,summary,content}=req.body
    const newpost=new Post({
        title:title,
        summary:summary,
        content:content, 
        author_id:data.exist._id, 
        author:data.exist.name, 
        cover:end[end.length-1]+"."+ext,
    })
    await newpost.save()
    res.send('post added') 
}
})


})
app.post('/addcomments',(req,res)=>{
    const {token}=req.cookies
    const {comment,id}=req.body
    jwt.verify(token,'abc',{},async (err,data)=>{
        if(err)res.status(400).send('servererror')
        else{
            const newcomment= new Comments({
                name:data.exist.name,
                comment:comment,
                post_id:id
            })         
            await newcomment.save()
            res.send("added") 
        }
    })
})
app.post('/getcomments',async (req,res)=>{
    const {id}=req.body
    const commentlist=await Comments.find({post_id:id})
    res.json(commentlist)
})
app.get('/getposts/:page',async (req,res)=>{
    try{
        const start=(parseInt(req.params['page'])-1)*6
        const postlist=await Post.find().skip(start).limit(6)
        res.json(postlist)
    }
    catch(e){
        res.status(400).send("error")
    }
}) 
app.get('/myposts',(req,res)=>{
    const {token}=req.cookies
    jwt.verify(token,'abc',{},async (err,data)=>{
        if(err){ 
            res.status(400).send('error') 
        }
        else{
            const response=await Post.find({author_id:data.exist._id})
            await res.json(response) 
        } 
    })
})
app.post('/deletepost',async (req,res)=>{
    const {id}=req.body
    try{
        await Comments.deleteMany({post_id:id})
        await Post.deleteOne({_id:id})
        res.send("done")
    }
    catch(e){
        console.log(e)
        res.status(400).send("error")
    }

})
app.post('/logout',(req,res)=>{
    res.cookie('token',"").json('ok')
})
app.get('/totalposts',async (req,res)=>{
    try{
        const size=await Post.count();
        res.json(size)
    }
    catch{
        res.status(400).send('error')
    }
})
app.listen(5000,()=>{
    console.log("listening")
})
