(function (window){

    // DOM references
    let searchBtn = document.querySelector('#bookSearchBtn')
    let searchField = document.querySelector('#bookSearchField')
    let resultsArea = document.querySelector('#searchResults')
    let resultsNum = document.querySelector('#resultNum')
    let loadingSpinner = document.querySelector('#loadingSpinner')

    // array for types of books. savedBooks and booksToRead will be used when backend is hooked up
    let books = []
    let savedBooks = []
    let booksToRead = []

    // initiate current view and num of results
    let numFound = 0
    let currentView = 'search'

    // allow search by click or enter
    searchBtn.addEventListener('click', search)
    searchField.addEventListener('keydown', (e) => {
        if(e.key === 'Enter'){
            search()
        }
    })

    // event listeners for adding to reading list, completing books, and rating.
    document.addEventListener('click', (e) => {
        let attribute = e.target.attributes.buttonFunc
        if(attribute && attribute.value == 'addToReadList'){
            addToReadList(e)
        } else if(attribute && attribute.value == 'completeBook'){
            completeBook(e)
        } else if(attribute && attribute.value == 'rateBook'){
            rateBook(e)
        }
    })

    // event listeners to keep track of view for rendering correct lists on updates
    document.addEventListener('click', (e) => {
        let attribute = e.target.attributes.buttonFunc
        if(attribute && attribute.value == 'readList'){
            currentView = 'readList'
            searchField.value = ''
            displayReadList()
        } else if(attribute && attribute.value == 'completedList'){
            currentView = 'completedList'
            searchField.value = ''
            displayCompletedList()
        }
    })

    // general search function
    function search() {
        let searchValue = searchField.value
        let sanitizedValue = searchValue.split(' ').join('+')
        let searchURL = 'https://openlibrary.org/search.json?q=' + sanitizedValue
        currentView = 'search'
        resultsNum.innerHTML = ''
        resultsArea.innerHTML = ''
        loadingSpinner.classList.remove('visually-hidden')

        // hit api and store results in books array
        fetch(searchURL)
        .then(res => res.json())
        .then(data => {
            numFound = data.numFound
            books = data.docs.map((book) => {
                return {
                    key: book.key,
                    author: book.author_name,
                    title: book.title,
                    year: book.first_publish_year,
                    readList: false,
                    read: false,
                    rating: null
                }
            })
        loadingSpinner.classList.add('visually-hidden')
        displayResults()
        })
    }

    // change readlist to true or false
    function addToReadList(event) {
        let bookID = event.target.id
        let book = books.find(book => book.key === bookID)
        if(!book.readList){
            book.readList = true
        } else {
            book.readList = false
        }
        
        // order here matters. if completedList isn't first, and you remove a book from the readlist while viewing completed,
        // it will rerender the readlist while on the completed view
        if(currentView === 'completedList'){
            displayCompletedList()
        } else if(currentView === 'readList'){
            displayReadList()
        } else{
            displayResults()
        }
    }

    // change read to true or false
    function completeBook(event){
        let bookID = event.target.id
        let book = books.find(book => book.key === bookID)
        if(!book.read){
            book.read = true
        } else {
            book.read = false
        }
        if(currentView === 'readList'){
            displayReadList()
        } else if(currentView == 'search'){
            displayResults()
        } else {
            displayCompletedList()
        }
    }
    
    // change rating for selected book
    function rateBook(event){
        let bookID = event.target.id
        let ratingID = '[id="rate' + bookID + '"]'
        let book = books.find(book => book.key === bookID)
        let rating = document.querySelector(ratingID).value
        book.rating = rating
        displayCompletedList()
    }

    // start of display functions

    function displayResults() {
        resultsNum.innerHTML = `Results Found: ${numFound}` 
        resultsArea.innerHTML = ''
        books.forEach((book) => {
            resultsArea.innerHTML += 
            `
                <div class="card my-2">
                    <div class="card-body">
                    
                        <div class="d-flex flex-column float-end w-25">
                            <button id="${book.key}" buttonFunc="addToReadList" class="btn btn-success float-end mb-2">${book.readList ? 'On Reading List <i class="fas fa-check"></i>' : 'Add to Reading List'}</button>
                            <button id="${book.key}" buttonFunc="completeBook" class="btn btn-success float-end">${book.read ? 'Read <i class="fas fa-check"></i>' : 'Read Book?'}</button>
                        </div>
                        <h5 class="card-title">${book.title}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${book.author ?? 'Unknown'}</h6>
                        <p class="card-text">First published: ${book.year ?? 'Unknown'}</p>
                    </div>
                </div>
            `
        })
    }

    function displayReadList(){
        resultsArea.innerHTML = ''
        let readListLength = 0
        books.filter((book) => {
            if(book.readList){
                resultsArea.innerHTML += 
                `
                    <div class="card my-2">
                        <div class="card-body">
                            <div class="d-flex flex-column float-end w-25">
                                <button id="${book.key}" buttonFunc="addToReadList" class="btn btn-success float-end mb-2">Remove from list?</i></button>
                                ${book.read ? 
                                    `<button id="${book.key}" buttonFunc="completeBook" class="btn btn-success float-end">Read <i class="fas fa-check"></i></button>` 
                                :
                                    `<button id="${book.key}" buttonFunc="completeBook" class="btn btn-success float-end">Completed the Book?</button>`
                                }
                            </div>
                            <h5 class="card-title">${book.title}</h5>
                            <h6 class="card-subtitle mb-2 text-muted">${book.author ?? 'Unknown'}</h6>
                            <p class="card-text">First published: ${book.year ?? 'Unknown'}</p>
                            
                        </div>
                    </div>
                `
                readListLength++
            }
        })
        resultsNum.innerHTML = `Books on Reading List: ${readListLength}` 
    }

    function displayCompletedList(){
        resultsArea.innerHTML = ''
        let completedLength = 0
        books.filter((book, index) => {
            if(book.read){
                resultsArea.innerHTML += 
                `
                    <div class="card my-2">
                        <div class="card-body">
                            <div class="d-flex flex-column float-end w-25">
                                <button id="${book.key}" buttonFunc="addToReadList" class="btn btn-success float-end mb-2">${book.readList ? 'On Reading List <i class="fas fa-check"></i>' : 'Add to Reading List'}</button>
                                ${book.read ? 
                                    `<button id="${book.key}" buttonFunc="completeBook" class="btn btn-success float-end mb-2">Read <i class="fas fa-check"></i></button>`
                                :
                                    `<button id="${book.key}" buttonFunc="completeBook" class="btn btn-success float-end mb-2">Completed the Book?</button>`
                                }
                                
                                <button id="${book.key}" class="btn btn-success float-end" data-bs-toggle="modal" data-bs-target="#rateModal${index}">${book.rating ? `You Rated ${book.rating} Stars` : 'Rate Book'}</button>
                                
                                <div class="modal fade" id="rateModal${index}" tabindex="-1">
                                    <div class="modal-dialog">
                                        <div class="modal-content">
                                        <div class="modal-body">
                                            <p>How would you rate ${book.title} out of 5 stars?</p>
                                            <select id="rate${book.key}">
                                                <option value="1">1</option>
                                                <option value="2">2</option>
                                                <option value="3">3</option>
                                                <option value="4">4</option>
                                                <option value="5">5</option>
                                            </select>
                                        </div>
                                        <div class="modal-footer">
                                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                            <button id="${book.key}" type="button" class="btn btn-primary" buttonFunc="rateBook" data-bs-dismiss="modal">Save Rating</button>
                                        </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <h5 class="card-title">${book.title}</h5>
                            <h6 class="card-subtitle mb-2 text-muted">${book.author ?? 'Unknown'}</h6>
                            <p class="card-text">First published: ${book.year ?? 'Unknown'}</p>
                            
                        </div>
                    </div>
                `
                completedLength++
            }
        })
        resultsNum.innerHTML = `Books Completed: ${completedLength}` 
    } 

    // end of display functions

})(window)