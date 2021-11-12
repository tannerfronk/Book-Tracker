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
app.get('/api/getAllBooks/', async (req, res) => {
    const books = await Book.find()
    console.log(books)
    return res.send(books)
})

// add book to reading list.
app.post('/api/readingList/', async (req, res) => {
    // if book is in database, change readList to opposite value
    let doesBookExist = await Book.findOne({ id: req.body.id })
    if(doesBookExist){
        const result = await Book.findOneAndDelete({ id: req.body.id })
        .then(async () => {
            let allBooks = await Book.find()
            return res.send(allBooks)
        })
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
            console.log('added book')
        })
        .then(async () => {
            let allBooks = await Book.find()
            return res.send(allBooks)
        })
    }
    

    
})