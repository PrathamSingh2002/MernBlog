const mongoose=require('mongoose')
const User=require('./User')

const PostModel=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    summary:{
        type:String,
        required:true
    }
    ,content:{
        type:String,
        required:true
    }
    ,author_id:{
        type:String,
        required:true
    }
    ,author:{
        type:String,
        required:true
    }
    ,cover:{
        type:String,
        default:"https://enviragallery.com/wp-content/uploads/2016/05/Set-Default-Featured-Image.jpg"
    }
},{
    timestamps:true 
}
)
const Post=new mongoose.model('Post',PostModel)
module.exports=Post