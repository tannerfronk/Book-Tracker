const express = require('express')
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const { mongoURI, port } = require('./config')
const Book = require('./models/Book')
const app = express()

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        app.listen(port, () => {
            console.log('server running on port ' + port)
        })
    })

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.text());

app.use(express.static('public'))

// format of book objects
// key: book.key,
// author: book.author_name,
// title: book.title,
// year: book.first_publish_year,
// readList: false,
// read: false,
// rating: null

// get all books from database
app.get('/api/getAllBooks', async (req, res) => {
    const books = await Book.find()
    console.log(books)
    return res.send(books)
})

// add book to reading list.
app.post('/api/readingList', async (req, res) => {
    // if book is in database, change readList to updated value
    let doesBookExist = await Book.findOne({ id: req.body.id })
    if (doesBookExist) {
        if (doesBookExist.read) {
            // if removing from reading list but is being tracked as read
            console.log(`Book: ${doesBookExist.title}, exists and is being tracked on the completed list`)
            doesBookExist.readList = req.body.readList
            const result = await doesBookExist.save()
            let allBooks = await Book.find()
            return res.send(allBooks)
        } else {
            // no longer being tracked in any list, delete book from DB
            console.log(`Book: ${doesBookExist.title}, no longer needs to be tracked. Deleting...`)
            const result = await Book.findOneAndDelete({ id: req.body.id })
                .then(async () => {
                    let allBooks = await Book.find()
                    return res.send(allBooks)
                })
        }
    } else {
        // if book isn't in database, add it
        const newBook = new Book({
            id: req.body.id,
            author: req.body.author,
            title: req.body.title,
            year: req.body.year,
            readList: req.body.readList,
            read: req.body.read,
            rating: req.body.rating
        })
        const result = newBook.save()
            .then(doc => {
                console.log(doc)
                console.log(`Added ${newBook.title} to reading list.`)
            })
            .then(async () => {
                let allBooks = await Book.find()
                return res.send(allBooks)
            })
    }
})

app.post('/api/markAsRead', async (req, res) => {
    // if book is in database, change read to updated value
    let doesBookExist = await Book.findOne({ id: req.body.id })
    if (doesBookExist) {
        if (doesBookExist.readList) {
            // if removing from completed list but is being tracked on reading list
            console.log(`Book: ${doesBookExist.title}, exists and is being tracked on the completed list`)
            doesBookExist.read = req.body.read
            const result = await doesBookExist.save()
            let allBooks = await Book.find()
            return res.send(allBooks)
        } else {
            // no longer being tracked in any list, delete book from DB
            console.log(`Book: ${doesBookExist.title}, no longer needs to be tracked. Deleting...`)
            const result = await Book.findOneAndDelete({ id: req.body.id })
                .then(async () => {
                    let allBooks = await Book.find()
                    return res.send(allBooks)
                })
        }
    } else {
        // if book isn't in database, add it
        const newBook = new Book({
            id: req.body.id,
            author: req.body.author,
            title: req.body.title,
            year: req.body.year,
            readList: req.body.readList,
            read: req.body.read,
            rating: req.body.rating
        })
        console.log(newBook)
        const result = newBook.save()
            .then(doc => {
                console.log(doc)
                console.log(`Added ${newBook.title} to completed list.`)
            })
            .then(async () => {
                let allBooks = await Book.find()
                return res.send(allBooks)
            })
    }
})

app.put('/api/rateBook', async (req, res) => {
    // update book rating
    let book = await Book.findOne({ id: req.body.id})
    let newRating = req.body.rating

    book.rating = newRating

    const result = book.save()
    .then(doc => {
        console.log(doc)
        console.log(`Rated ${req.body.title} ${newRating} of 5 stars.`)
    })
    .then(async () => {
        let allBooks = await Book.find()
        return res.send(allBooks)
    })
})