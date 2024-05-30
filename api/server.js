require('dotenv').config(); // Load environment variables from .env file
console.log('JWT_SECRET:', process.env.JWT_SECRET); // Add this line for debugging

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // Make sure to create the User model
const Todo = require('./models/Todo');
const auth = require('./middleware/auth');


const app = express();

app.use(express.json());
app.use(cors()); // stops any cross origin errors

mongoose.connect('mongodb://localhost:27017/mern-todo', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("Connected to MongoDB")).catch(console.error);

// GET /todos route with authentication
app.get('/todos', auth, async (req, res) => {
    try {
        const todos = await Todo.find({ user: req.user._id });
        res.json(todos); // Return an array of todos
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/todo/new', auth, (req, res) => {
    const todo = new Todo({
        text: req.body.text,
        user: req.user._id
    });
    todo.save();
    res.json(todo);
});

app.delete('/todo/delete/:id', auth, async (req, res) => {
    const result = await Todo.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ result });
});
/*
app.get('/todo/complete/:id', async (req, res) => {
    const todo = await Todo.findById(req.params.id);
    todo.complete = !todo.complete;
    todo.save();
    res.json(todo);
});
*/
app.get('/todo/complete/:id', auth, async (req, res) => {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });

    if (todo) {
        todo.complete = !todo.complete;
        await todo.save();
        res.json(todo);
    } else {
        res.status(404).json({ message: 'Todo not found' });
    }
});

// User sign-up
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ success: true, token });
});

// User login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(400).json({ success: false, message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ success: true, token });
});

app.listen(3001, () => console.log("Server started on port 3001"));
