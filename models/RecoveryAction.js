const mongoose=require('mongoose');
const RecoveryActionSchema=new mongoose.Schema({userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},title:{type:String,required:true,maxlength:180},description:{type:String,required:true,maxlength:500},status:{type:String,enum:['suggested','done','skipped'],default:'suggested'},actionDate:{type:String,required:true}},{timestamps:true});
module.exports=mongoose.model('RecoveryAction',RecoveryActionSchema);
