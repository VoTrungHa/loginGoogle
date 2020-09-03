const mongoose=require('mongoose');
const crypto =require('crypto');

const userSchane=new mongoose.Schema({
    email:{type:String,trim:true,required:true,unique:true,lowercase:true},
    name:{type:String,trim:true,required:true},
    password:{type:String,require:true}, 
    role:{
        type:String,default:"Normal"
    },
    resetPasswordlink:{
        data:String,
        default:""
    }

},{timestamps:true})
module.exports=mongoose.model("User",userSchane);
