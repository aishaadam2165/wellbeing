const mongoose=require('mongoose');
const ChatMessageSchema=new mongoose.Schema({userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},role:{type:String,enum:['user','assistant'],required:true},message:{type:String,required:true,maxlength:5000},mode:{type:String,default:'gemma'}},{timestamps:true});
ChatMessageSchema.index({userId:1,createdAt:-1});
module.exports=mongoose.model('ChatMessage',ChatMessageSchema);
