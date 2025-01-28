const express = require('express');
const router = express.Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const usersModel = require('../models/users');
const postsModel = require('../models/post')

const jwtSecret = process.env.JWT_Secret

const

    adminLayout = '../views/layouts/admin.ejs'

// checking login middleware
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token
    console.log(`this is token print from authMiddleware ${token}`)
    if (!token) {
        return res.status(401).json({ message: "UnAuthorized" })
    }

    try {
        const decoded = jwt.verify(token, jwtSecret)
        req.userId = decoded.userId
        next()
    } catch (error) {
        res.status(401).json({ message: "UnAuthorized" })
    }
}

// Admin -> get (admin page to login or register)

router.get('/admin', async (req, res) => {


    const locals = {
        title: "Admin",
        description: "this is Blogs App Node & Express"
    }

    try {
        res.render('admin/index', { locals, layout: adminLayout })
    } catch (error) {

    }

})

// Admin -> post (login)

router.post('/admin', async (req, res) => {

    try {

        const { username: userNameInput, password: PasswordInput } = req.body

        const validateUser = await usersModel.findOne({ username: userNameInput })
        console.log(`validate user value is -> ${validateUser}`)
        if (validateUser) {
            // this is mean you have the username in database

            const checkPassword = await bcrypt.compare(PasswordInput, validateUser.password)
            console.log(`check password value from bcrypt ${checkPassword} ---- this is user password input ${PasswordInput}`)
            if (checkPassword) {
                // this is mean the password and the user name is true
                const token = jwt.sign({ userId: validateUser._id }, jwtSecret)

                res.cookie('token', token, { httpOnly: true })

                res.redirect('/dashboard')
            } else {
                res.status(404).send("User Name Or Password Not Found")
            }
        } else {
            res.status(404).send("User Name Or Password Not Found")
        }
    } catch (error) {
        res.status(500).send("Internal Server Error")
    }
})

// Admin -> post (register)

router.post('/register', async (req, res) => {
    try {
        const { username: usernamevalue, password: passwordvalue } = req.body
        const slat = 10
        const hashedPassword = await bcrypt.hash(passwordvalue, slat)
        console.log(`this is message from try register and this is username -> ${usernamevalue} and this is password ->${passwordvalue}`)
        let createUser = await usersModel.create({
            username: usernamevalue,
            password: hashedPassword
        })
        console.log(`this is user created in database ${createUser}`)

        if (createUser) {
            res.status(201).json({ message: "user created", createUser })
        } else {
            res.status(400).json({ message: "User can't created" })
        }

    } catch (error) {
        console.log(`this is error when register or create new user -> ${error}`)
        res.status(500).send("Internel Server Error")
    }
})

// Admin -> Get (DashBoard) after admin login or register

router.get('/dashboard', authMiddleware, async (req, res) => {

    try {
        const locals = {
            title: "DashBoard",
            description: "NodeJs App simple blog, used NodeJs & express"
        }

        const data = await postsModel.find({})

        res.render('admin/dashboard', { locals, data, layout: adminLayout })
    } catch (error) {

    }

})

// Admin -> Get (get create new post page)

router.get('/add-post', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: "Add Post",
            description: "NodeJs Blog App"
        }
        const data = await postsModel.find()
        res.render('admin/add-post', {
            locals,
        })
    } catch (error) {
        res.status(400).send("Internal Server Error")
    }
})

// Admin -> Post (write new post)

router.post('/add-post', authMiddleware, async (req, res) => {
    console.log(`this is content you write it ${req.body.title}`)
    try {
        const newPost = await postsModel.create({
            title: req.body.title,
            body: req.body.body,
        })
        res.redirect(`/dashboard`)
    } catch (error) {

    }
})

// Admin -> put (update page)

router.put('/edit-post/:id', authMiddleware, async (req, res) => {
    console.log(`this is content you write it ${req.body.title}`)
    try {
        const currentPost = await postsModel.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now()
        })
        res.redirect(`/dashboard`)
    } catch (error) {

    }
})

// Admin -> Get (Get updated page)

router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        const currentPost = await postsModel.findOne({ _id: req.params.id })
        res.render(`admin/edit-post`, { data: currentPost })
    } catch (error) {

    }
})

router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
    try {
        await postsModel.findByIdAndDelete({ _id: req.params.id })
        res.redirect('/dashboard')
    } catch (error) {
        res.status(500).send("Delet Error, Try again later")
    }
})

router.get('/logout', async (req, res) => {
    res.clearCookie('token')
    res.redirect('/')
})

module.exports = router