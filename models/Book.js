const {model, Schema} = require('mongoose')

const Book = new Schema({
    id: {
        type: String,
        required: true,
    },
    author: Array,
    title: String,
    year: {
        type: Number,
        default: undefined,
    },
    readList: Boolean,
    read: Boolean,
    rating: {
        type: String,
        default: ''
    }
})

module.exports = model('book', Book)