const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

//Routes

router.get('', async (req, res) => {
    try {

        const locals = {
            title: 'Home',
            description: 'This is the description of the home page'
        }

        let perPage = 10;
        let page = req.query.page || 1;

        const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
            .skip((perPage * page) - perPage)
            .limit(perPage)
            .exec();

        const count = await Post.countDocuments();
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);

        res.render('index', {
            locals,
            data,
            current: page,
            nextPage: hasNextPage ? nextPage : null,
            currentRoute: '/',
        });



    } catch (err) {
        console.log(err);
    }


});

router.get('/post/:id', async (req, res) => {

    try {

        let slug = req.params.id;
        const data = await Post.findById({ _id: slug });

        const locals = {
            title: data.title,
            description: 'This is the description of the post page'
        }
        res.render('post', { locals, data, currentRoute: `/post/${slug}` });


    } catch (err) {
        console.log(err);
    }
});

router.post('/search', async (req, res) => {
    try {
        const locals = {
            title: 'Search',
            description: 'This is the description of the search page'
        }

        let searchTerm = req.body.searchTerm;

        const searchNoSpecialChars = searchTerm.replace(/[^a-zA-Z0-9]/g, "");
        const data = await Post.find({ 
            $or: [
                {title: { $regex: new RegExp(searchNoSpecialChars, 'i') }},
                {body: { $regex: new RegExp(searchNoSpecialChars, 'i') }}
            ]
           
        });

        res.render('search', { locals, data });

    } catch (err) {
        console.log(err);
    }
});


router.get('/about', (req, res) => {
    res.render('about',{
        currentRoute: '/about',
    });
});

router.get('/contact', (req, res) => {
    res.render('contact',{
        currentRoute: '/contact',
    });
});

module.exports = router;