require("dotenv").config()
const express = require('express')
const helmet = require("helmet")
const expressLayout = require('express-ejs-layouts')
const cookieParser = require("cookie-parser")
const mongostore = require("connect-mongo")
const methodOverride = require("method-override")
const app = express()


// importing files 
const mainRoutes = require('./server/routes/main')
const adminRoutes = require('./server/routes/admin')
const mongodbConnection = require('./server/config/database')
const session = require("express-session")

const port = process.env.PORT || 3000

// middlewares 

app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(session({
    secret: 'test for secret sessions',
    resave: false,
    saveUninitialized: true,
    store: mongostore.create({
        mongoUrl: process.env.MONGO_URL
    }),
    cookie: { maxAge: new Date(Date.now() + (3600000)) }
}))

app.use(methodOverride('_method'))

// database connection
mongodbConnection()

// used public folder to set static files (css,images,html,js)

app.use(express.static('public'))

// templating engine middleware -> used with layouts and views set method not use 

app.use(expressLayout)
app.set('layout', './layouts/main')
app.set('view engine', 'ejs')

// routes 

app.use('/', mainRoutes)
app.use('/', adminRoutes)


app.listen(port, () => {
    console.log(`your application run in ${process.env.NODE_ENV} and your port is ${port}`)
})