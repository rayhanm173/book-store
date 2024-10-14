const API_URL = 'https://gutendex.com/books/';
const bookDetailsDiv = document.getElementById('bookDetails');

// Get book ID from the URL
const urlParams = new URLSearchParams(window.location.search);
const bookId = urlParams.get('id');


// Function to show skeleton loaders
function showSkeletonLoaders() {
    bookDetailsDiv.innerHTML = ''; // Clear any existing content

    // Create 3 skeleton loader items
    for (let i = 0; i < 1; i++) {
        const skeletonItem = document.createElement('div');
        skeletonItem.className = 'book-item';

        skeletonItem.innerHTML = `
            <div class="skeleton skeleton-img"></div>
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-author"></div>
        `;

        bookDetailsDiv.appendChild(skeletonItem);
    }
}

// Fetch book details using the book ID
async function fetchBookDetails() {

    showSkeletonLoaders()
    const response = await fetch(`${API_URL}?ids=${bookId}`);
    const data = await response.json();
    const book = data.results[0];

    displayBookDetails(book);
}

// Display the book details on the page
function displayBookDetails(book) {
    bookDetailsDiv.innerHTML = `
        <h1>${book.title}</h1>
        <img src="${book.formats['image/jpeg']}" alt="${book.title}">
        <h3>Author: ${book.authors.map(author => author.name).join(', ')}</h3>
        <p><strong>Subjects:</strong> ${book.subjects.join(', ')}</p>
        <p><strong>Download Links:</strong></p>
        <ul>
            ${Object.keys(book.formats).map(format => 
                `<li class='links'><a href="${book.formats[format]}" target="_blank">${format=="text/html"?'Read':format=="application/epub+zip"?'Download Epub':format=="application/x-mobipocket-ebook"?'Download Mobi':format=="application/rdf+xml"?'Download RDF':format=="image/jpeg"?'View Original Picture':format=="text/plain"?'Read As Text':'Download as ZIP'}</a></li>`
            ).join('')}
        </ul>
    `;
}

// Initialize
fetchBookDetails();
