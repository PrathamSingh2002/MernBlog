const mongoose=require('mongoose')
const UserModel=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    }
    ,password:{
        type:String,
        required:true
    }
})
const User=new mongoose.model('User',UserModel)
module.exports=User