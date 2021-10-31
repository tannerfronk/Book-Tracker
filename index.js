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
                        <h5 class="card-title">${book.title}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${book.author ?? 'Unknown'}</h6>
                        <p class="card-text">First published: ${book.year ?? 'Unknown'}</p>
                        <button id="${book.key}" buttonFunc="addToReadList" class="btn btn-success float-end w-25">${book.readList ? 'On Read List <i class="fas fa-check"></i>' : 'Add to Read List'}</button>
                    </div>
                </div>
            `
        })
    }

    
    document.addEventListener('click', (e) => {
        if(e.target.attributes.buttonFunc && e.target.attributes.buttonFunc.value == 'addToReadList'){
            addToReadList(e)
        }
    })

    // function handleEvents(e) {
    //     if(e.target.attributes.buttonFunc.value == 'addToReadList') {
    //         addToReadList()
    //     }
    // }


    // change readlist to true or false
    function addToReadList(event) {
        let bookID = event.target.id
        let book = books.find(book => book.key === bookID)
        if(!book.readList){
            book.readList = true
        } else {
            book.readList = false
        }
        
        console.log(books)
        displayResults()
    }



    
})(window)