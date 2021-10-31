(function (window){

    // DOM references
    let searchBtn = document.querySelector('#bookSearchBtn')
    let searchField = document.querySelector('#bookSearchField')
    let resultsArea = document.querySelector('#searchResults')
    let resultsNum = document.querySelector('#resultNum')

    // array for searched books
    let books = []
    let savedBooks = []
    let booksToRead = []
    let numFound = 0
    let currentView = ''

    // allow search by click or enter
    searchBtn.addEventListener('click', search)
    searchField.addEventListener('keydown', (e) => {
        if(e.key === 'Enter'){
            search()
        }
    })

    // general search function
    function search() {
        let searchValue = searchField.value
        let sanitizedValue = searchValue.split(' ').join('+')
        let searchURL = 'http://openlibrary.org/search.json?q=' + sanitizedValue
        currentView = 'search'
        console.log(searchURL)

        // hit api and store results in books array
        fetch(searchURL)
        .then(res => res.json())
        .then(data => {
            console.log(data)
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
            
        console.log(books)
        displayResults()
        })
    }

    // display results
    function displayResults() {
        resultsNum.innerHTML = `Results Found: ${numFound}` 
        resultsArea.innerHTML = ''
        books.forEach((book) => {
            resultsArea.innerHTML += 
            `
                <div class="card my-2">
                    <div class="card-body">
                        <button id="${book.key}" buttonFunc="addToReadList" class="btn btn-success float-end">${book.readList ? 'On Read List <i class="fas fa-check"></i>' : 'Add to Read List'}</button>
                        <h5 class="card-title">${book.title}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${book.author ?? 'Unknown'}</h6>
                        <p class="card-text">First published: ${book.year ?? 'Unknown'}</p>
                    </div>
                </div>
            `
        })
    }

    document.addEventListener('click', (e) => {
        let attribute = e.target.attributes.buttonFunc
        if(attribute && attribute.value == 'addToReadList'){
            addToReadList(e)
        } else if(attribute && attribute.value == 'completeBook'){
            completeBook(e)
        }
    })

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
        console.log(bookID)
        let book = books.find(book => book.key === bookID)
        console.log(book)
        if(!book.read){
            book.read = true
        } else {
            book.read = false
        }
        if(currentView === 'readList'){
            displayReadList()
        } else {
            displayCompletedList()
        }
    }

    document.addEventListener('click', (e) => {
        let attribute = e.target.attributes.buttonFunc
        if(attribute && attribute.value == 'readList'){
            currentView = 'readList'
            displayReadList()
        } else if(attribute && attribute.value == 'completedList'){
            currentView = 'completedList'
            displayCompletedList()
        }
    })

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
                                <button id="${book.key}" buttonFunc="addToReadList" class="btn btn-success float-end mb-2">${book.readList ? 'On Read List <i class="fas fa-check"></i>' : 'Add to Read List'}</i></button>
                                ${book.read ? 
                                    `<button id="${book.key}" buttonFunc="completeBook" class="btn btn-success float-end">Read <i class="fas fa-check"></i></button>` :
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
        books.filter((book) => {
            if(book.read){
                resultsArea.innerHTML += 
                `
                    <div class="card my-2">
                        <div class="card-body">
                            <div class="d-flex flex-column float-end w-25">
                                <button id="${book.key}" buttonFunc="addToReadList" class="btn btn-success float-end mb-2">${book.readList ? 'On Read List <i class="fas fa-check"></i>' : 'Add to Read List'}</button>
                                ${book.read ? 
                                    '<button id="${book.key}" buttonFunc="completeBook" class="btn btn-success float-end">Read <i class="fas fa-check"></i></button>' :
                                    '<button id="${book.key}" buttonFunc="completeBook" class="btn btn-success float-end">Completed the Book?</button>'
                                }
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



    
})(window)