const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const res = require('express/lib/response');


const authMiddeleware = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

const adminLayout = '../views/layouts/admin';
router.get('/admin', async (req, res) => {
    try {

        const locals = {
            title: 'Admin',
            description: 'This is the description of the admin page'
        }

        res.render('admin/index', {
            locals,
            layout: adminLayout
        });

    } catch (err) {
        console.log(err);
    }
});

router.post('/admin', async (req, res) => {
    try {

        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/dashboard');



    } catch (err) {
        console.log(err);
    }
});


router.get('/dashboard', authMiddeleware, async (req, res) => {

    try {
        const locals = {
         title: 'Dashboard',
         description: 'This is the description of the dashboard page',
        }
        const data = await Post.find();
        res.render('admin/dashboard', {
            data,
            locals,
            layout: adminLayout
        });
    }
    catch (err) {
        console.log(err);
    }   

}),

router.get('/add-post', authMiddeleware, async (req, res) => {
    try {
        const locals = {
            title: 'Add Post',
            description: 'This is the description of the add post page',
        }
        const data = await Post.find();
        res.render('admin/add-post', {
            locals,
            layout: adminLayout
        });
    } catch (err) {
        console.log(err);
    }
});

router.post('/add-post', authMiddeleware, async (req, res) => {
    try {
        console.log(req.body);

        try {
            const newPost = new Post({
                title: req.body.title,
                body: req.body.body
            });

            await Post.create(newPost);
            res.redirect('/dashboard');

        } catch (err) {   
            console.log(err);  
            res.status(500).json({ message: 'Internal server error' });
        }

    
    
    } catch (err) {
        console.log(err);
    }
});

router.get('/edit-post/:id', authMiddeleware, async (req, res) => {
    try {
        const locals = {
            title: 'Edit Post',
            description: 'This is the description of the edit post page',
        }
        const data = await Post.findById(req.params.id);
        res.render('admin/edit-post', {
            data,
            locals,
            layout: adminLayout
        });
    } catch (err) {
        console.log(err);
    }
});

router.put('/edit-post/:id', authMiddeleware, async (req, res) => {
    try {
       await Post.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        body: req.body.body,
        updatedAt: Date.now(),
       });

       res.redirect('/edit-post/' + req.params.id);
    
    
    } catch (err) {
        console.log(err);
    }
});


router.post('/register', async (req, res) => {
    try {

        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user = await User.create({
                username,
                password: hashedPassword
            });

            res.status(201).json({ message: 'User created successfully', user });

        } catch (err) {
            if (err.code === 11000) {
                return res.status(400).json({ message: 'Username already exists' });
            }
            res.status(500).json({ message: 'Internal server error' });
        }



    } catch (err) {
        console.log(err);
    }
});



router.delete('/delete-post/:id', authMiddeleware, async (req, res) => {
    try {
       await Post.deleteOne({ _id: req.params.id });
        res.redirect('/dashboard');
    } catch (err) {
        console.log(err);
    }
});

router.get('/logout', async (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});


module.exports = router;