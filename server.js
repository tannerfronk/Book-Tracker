const express = require('express')
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const { mongoURI, port } = require('./config')
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