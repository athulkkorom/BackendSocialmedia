import express from "express";
import bcrypt from 'bcrypt';
import User from "../Model/User.js"

const router = express.Router();
router.post('/signup', async (req, res) => {
  const { userName, password, firstName,lastName } = req.body;

  // Check if username is already in use
  const existingUser = await User.findOne({ userName });
  if (existingUser) {
    return res.status(409).json({ message: 'UserName already in use' });
  }

  // Hash password
  const saltRounds = 10;
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({ firstName,lastName,userName, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
