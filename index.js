import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';

import User from './Model/User.js';
import Post from './Model/Post.js';

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));

const storage = multer.diskStorage({
  destination: './Uploads',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
  },
});

const upload = multer({ storage });

mongoose
  .connect('mongodb://localhost:27017/Socialmedia', {})
  .then(() => {
    console.log('Connected to MongoDB');
    app.post('/signup', async (req, res) => {
      const { userName, password, firstName, lastName } = req.body;

      // Check if username is already in use
      const existingUser = await User.findOne({ userName });
      if (existingUser) {
        return res.status(409).json({ message: 'Username already in use' });
      }

      // Hash password
      const saltRounds = 10;
      try {
        bcrypt.genSalt(saltRounds,(error,salt)=>{
         bcrypt.hash(password,salt,async(error,hashedPassword)=>{
           const user = new User({ firstName,lastName,userName, password: hashedPassword });
           await user.save();
           res.status(201).json({ message: 'User created' });
         })
        })
         } catch (error) {
           console.error(err);
           res.status(500).json({ message: 'Internal server error' });
         }
    });

    app.post('/login', async (req, res) => {
      const { userName, password } = req.body;
    
      // Check if user exists
      const user = await User.findOne({ userName });
      if (!user) {
        return res.status(401).json({ message: 'Authentication failed' });
      }
    
      // Check password
      bcrypt.compare(password,user.password,(error,result)=>{
        if(result===true){
          const token = jwt.sign({ userName: user.userName }, 'mysecretkey', { expiresIn: '1h' });
          res.status(200).json({ message: 'Authentication successful', token, user });
        }
        else{
          res.status(401).json({ message: 'Authentication failed' });
  
  
        }
      })
    });
    
    app.put('/bio', async (req, res) => {
      const { userName, bio } = req.body;
      
      try {
        const existingUser = await User.findOne({ userName });
        if (!existingUser) {
          return res.status(404).json({ message: 'User not found' });
        }
    
        existingUser.bio = bio; // Update the bio field
    
        await existingUser.save(); // Save the updated user
    
        res.status(200).json({ message: 'Bio updated successfully', user: existingUser });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
      }
    });
    // ... Existing code ...

app.get('/bio/:userName', async (req, res) => {
  const { userName } = req.params;

  try {
    const user = await User.findOne({ userName });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const bio = user.bio;
    const firstName = user.firstName;
    const profileImg = user.profileImg
    const coverImg = user.coverImg
    res.status(200).json({ bio,firstName,profileImg,coverImg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ... Existing code ...



app.put('/uploadProfileImage', upload.single('profileImage'), async (req, res) => {
  try {
    const { userName } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const profileImagePath = req.file.path;

    // Update the user's profileImg field in MongoDB
    const updatedUser = await User.findOneAndUpdate(
      { userName },
      { profileImg: profileImagePath },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Profile image uploaded successfully', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.put('/uploadCoverImage', upload.single('coverImage'), async (req, res) => {
  try {
    const { userName } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const coverImagePath = req.file.path;

    // Update the user's profileImg field in MongoDB
    const updatedUser = await User.findOneAndUpdate(
      { userName },
      { coverImg: coverImagePath },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Cover image uploaded successfully', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.use('/uploads', express.static('Uploads'));
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    if (!users) {
      return res.status(404).json({ message: 'Users not found' });
    }

    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.post('/post', upload.single('image'), async(req,res)=>{
  const {userName,describtion} =req.body
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const imagePath = req.file.path;
  try{
  const post = new Post({userName,describtion,image:imagePath})
  await post.save()
  res.status(201).json({ message: 'Post created' });

  }catch(err){
  console.error(err)
  }
})
app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find();
    if (!posts) {
      return res.status(404).json({ message: 'posts not found' });
    }

    res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.get('/posts/:userName', async (req, res) => {
  const{userName}=req.params
  try {
    const posts = await Post.find({userName});
    if (!posts) {
      return res.status(404).json({ message: 'posts not found' });
    }

    res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.get('/search/?:userName',async (req,res)=>{
  const {userName} =req.params
  try{
    const user =await User.findOne({userName})
    if(!user){
      return res.status(404).json({message:"user not found"})
    }
    res.status(200).json(user)
  }catch(error){
    console.log(error)
  }
})
app.post('/like/:_id', async (req, res) => {
  try {
    const { _id } = req.params;
    const { userName } = req.body;
    const post = await Post.findById(_id.trim());

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userLiked = post.Liked.includes(userName);
    if (userLiked) {
      return res.status(400).json({ message: 'Already Liked' });
    }

    post.Liked.push(userName);
    post.Like += 1;

    await post.save();

    res.json({ message: 'Post liked successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/comment/:_id', async (req, res) => {
  try {
    const { _id } = req.params;
    const post = await Post.findById(_id.trim());
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post)
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});
app.post('/comment/:_id', async (req, res) => {
  try {
    const { _id } = req.params;
    const { userName, comments } = req.body;

    const post = await Post.findById(_id.trim());
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      userName,
      comments
    };

    post.Comment.push(newComment);
    await post.save();

    res.json({ success: true, message: 'Comment added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding comment', error });
  }
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
})
.catch((err) => {
console.error('Error connecting to MongoDB', err);
});

export default app;
