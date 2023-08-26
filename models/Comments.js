const mongoose =require('mongoose')
const CommentsModel=new mongoose.Schema({
    name:{
        type:String,
        required:true
    }
    ,
    post_id:{
        type:String,
        required:true
    },
    comment:{
        type:String,
        required:true
    }
},
{
    timestamps:true
}
)
const Comments=new mongoose.model('Comments',CommentsModel)
module.exports=Comments