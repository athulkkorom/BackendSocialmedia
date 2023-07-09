import mongoose from 'mongoose'
const { Schema } = mongoose;

const userSchema = new Schema({
    firstName: {type:String,required:true},
    lastName: {type:String,required:true},
    password:{type:String,required:true},
    userName:{type:String,required:true},
    profileImg: {type:String},
    coverImg: {type:String},
    bio: {type:String},
    follower: {type:String},
    following: {type:String},


  });
  const User = mongoose.model('User', userSchema)
   export default User;