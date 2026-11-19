const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  name:{type:String,required:true,trim:true,maxlength:100},
  email:{type:String,required:true,trim:true,lowercase:true,unique:true,index:true},
  passwordHash:{type:String,required:true},
  healthContextConsent:{type:Boolean,default:false},
  healthProfile:{conditions:{type:String,default:'',maxlength:1000},medications:{type:String,default:'',maxlength:1000},allergies:{type:String,default:'',maxlength:500},goals:{type:String,default:'',maxlength:500}}
},{timestamps:true});
module.exports=mongoose.model('User',UserSchema);
