const mongoose=require('mongoose');
const CheckinSchema=new mongoose.Schema({userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},mood:{type:Number,min:1,max:5,required:true},energy:{type:Number,min:1,max:5,required:true},stress:{type:Number,min:1,max:5,required:true},sleepHours:{type:Number,min:0,max:24,required:true},activityMinutes:{type:Number,min:0,max:1440,default:0},note:{type:String,maxlength:500,default:''}},{timestamps:true});
CheckinSchema.index({userId:1,createdAt:-1});
module.exports=mongoose.model('Checkin',CheckinSchema);
