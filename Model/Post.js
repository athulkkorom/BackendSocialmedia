import mongoose from 'mongoose'
const { Schema } = mongoose;

const postSchema = new Schema({
    userName:{type:String,required:true},
    image:{type:String,required:true},
    describtion:{type:String},
      Like: { type: Number, default: 0 },  
      Liked:[{type:String}],
       Comment:[{userName:String,comments:String}]
    
  });
  const Post = mongoose.model('Post', postSchema)
   export default Post;