const express = require('express')

const router = express.Router()
const postModels = require('../models/post')


router.get('', async (req, res) => {


    try {
        // this is number will view from data per page

        let perPage = 10
        // this is current page number
        let page = req.query.page || 1


        // the name for this constant must be locals if you change in it will have an problem 
        const locals = {
            title: "Blogs App",
            description: "this is Blogs App Node & Express"
        }

        const data = await postModels.aggregate([{
            $sort: {
                createdAt: -1
            }
        }]).skip(perPage * page - perPage).limit(perPage).exec();

        // here count all of data on database
        const count = await postModels.countDocuments()

        // here we cast page value to integer and add one to get next page
        const nextPage = parseInt(page) + 1

        const prevoiusPage = 1

        const hasNextPage = nextPage <= Math.ceil(count / perPage)

        res.render('index', {
            locals,
            data,
            current: page,
            nextPage: hasNextPage ? nextPage : null,
            prevoiusPage: hasNextPage ? null : prevoiusPage
        })

    } catch (error) {
        console.log(error)
        res.status(500).send("Internal Server Error")
    }

})


// Get post using id :

router.get('/post/:id', async (req, res) => {
    try {
        let slug = req.params.id
        console.log(`this is value saved in slug ${slug}`)

        // here count all of data on database
        const data = await postModels.findById({ _id: slug })

        const locals = {
            title: data.title,
            description: data.body
        }

        res.render('post', {
            locals
        })

    } catch (error) {
        console.log(error)
        res.status(500).send("Internal Server Error")
    }

})


router.get('/about', (req, res) => {
    res.render('about')
})

// POST -> used to search 

router.post('/search', async (req, res) => {



    try {
        const locals = {
            title: "Search",
            description: "this is Blogs App Node & Express"
        }

        let searchTerm = req.body.searchTerm

        const searchWithoutSpechialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "")

        const data = await postModels.find({
            $or: [
                {
                    title: { $regex: new RegExp(searchWithoutSpechialChar, 'i') },
                    body: { $regex: new RegExp(searchWithoutSpechialChar, 'i') },
                }
            ]
        })

        console.log(`this is data return from searchTerm ${searchWithoutSpechialChar}`)

        res.render('search', { locals, data })

    } catch (error) {

    }
})

module.exports = router

// insert data in first

// function insertPostData() {
//     postModels.insertMany([
//         {
//             title: "Building APIs with Node.js",
//             body: "Learn how to use Node.js to build RESTful APIs using frameworks like Express.js"
//         },
//         {
//             title: "Deployment of Node.js applications",
//             body: "Understand the different ways to deploy your Node.js applications, including on-premises, cloud, and container environments..."
//         },
//         {
//             title: "Authentication and Authorization in Node.js",
//             body: "Learn how to add authentication and authorization to your Node.js web applications using Passport.js or other authentication libraries."
//         },
//         {
//             title: "Understand how to work with MongoDB and Mongoose",
//             body: "Understand how to work with MongoDB and Mongoose, an Object Data Modeling (ODM) library, in Node.js applications."
//         },
//         {
//             title: "build real-time, event-driven applications in Node.js",
//             body: "Socket.io: Learn how to use Socket.io to build real-time, event-driven applications in Node.js."
//         },
//         {
//             title: "Discover how to use Express.js",
//             body: "Discover how to use Express.js, a popular Node.js web framework, to build web applications."
//         },
//         {
//             title: "Asynchronous Programming with Node.js",
//             body: "Asynchronous Programming with Node.js: Explore the asynchronous nature of Node.js and how it allows for non-blocking I/O operations."
//         },
//         {
//             title: "Learn the basics of Node.js and its architecture",
//             body: "Learn the basics of Node.js and its architecture, how it works, and why it is popular among developers."
//         },
//         {
//             title: "NodeJs Limiting Network Traffic",
//             body: "Learn how to limit netowrk traffic."
//         },
//         {
//             title: "Learn Morgan - HTTP Request logger for NodeJs",
//             body: "Learn Morgan."
//         },
//     ])
// }

// insertPostData();