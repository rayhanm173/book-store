const API_URL = 'https://gutendex.com/books';
let books = [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let savedSearchTerm = localStorage.getItem('searchTerm') || '';
let savedGenre = localStorage.getItem('genre') || 'all';

// Function to extract genres from subjects and remove duplicates and "--"
function extractGenres(subjects) {
    const uniqueGenres = new Set();

    subjects.forEach(subject => {
        // Remove "--" and extra spaces
        const cleanedSubject = subject.replace(/--/g, "").trim();
        
        // Split the subject by commas and add each part to the set
        cleanedSubject.split(',').forEach(subPart => {
            uniqueGenres.add(subPart.trim());
        });
    });

    // Return the genres as a comma-separated string
    return Array.from(uniqueGenres).join(', ');
}

// Pagination variables
let currentPage = 1;
const booksPerPage = 10;

// DOM Elements
const bookList = document.getElementById('bookList');
const paginationDiv = document.getElementById('pagination');
const wishlistPage = document.getElementById('wishlistPage');
const searchInput = document.getElementById('searchInput');
const genreFilter = document.getElementById('genreFilter');

// Set initial search and genre filter values from localStorage
searchInput.value = savedSearchTerm;
genreFilter.value = savedGenre;

// Function to show skeleton loaders
function showSkeletonLoaders() {
    bookList.innerHTML = ''; // Clear any existing content

    // Create 3 skeleton loader items
    for (let i = 0; i < 10; i++) {
        const skeletonItem = document.createElement('div');
        skeletonItem.className = 'book-item';

        skeletonItem.innerHTML = `
            <div class="skeleton skeleton-img"></div>
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-author"></div>
        `;

        bookList.appendChild(skeletonItem);
    }
}

// Fetch Books
async function fetchBooks() {
    // Show skeleton loaders before fetching the books
    showSkeletonLoaders();

    const response = await fetch(`${API_URL}`);
    const data = await response.json();
    books = data.results;
    
    displayBooks();
    setupPagination();
}

// Display Books with pagination and filtering logic
function displayBooks() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedGenre = genreFilter.value;

    const filteredBooks = books.filter(book => {
        const matchesSearch = book.title.toLowerCase().includes(searchTerm);
        const bookGenres = extractGenres(book.subjects);  // Extract genres for each book
        const matchesGenre = selectedGenre === 'all' || 
            bookGenres.toLowerCase().includes(selectedGenre.toLowerCase());
        return matchesSearch && matchesGenre;
    });

    // Pagination logic
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const paginatedBooks = filteredBooks.slice(startIndex, endIndex);

    // Animate book display
    bookList.innerHTML = ''; // Clear the list first
    paginatedBooks.forEach(book => {
        const bookItem = document.createElement('div');
        bookItem.className = 'book-item';
        bookItem.dataset.id = book.id;

        const bookGenres = extractGenres(book.subjects);  // Extract genres again for display

        bookItem.innerHTML = `
            <a href="book.html?id=${book.id}">
                <img src="${book.formats['image/jpeg']}" alt="${book.title}">
                <h3 class='book-title'>${book.id}. ${book.title}</h3>
            </a>
            <p>Author: ${book.authors.map(author => author.name).join(', ')}</p>
            <p>Genre: ${bookGenres}</p>
            <span class="love-icon ${wishlist.includes(book.id) ? 'fas' : 'far'} fa-heart" 
                  onclick="toggleWishlist(${book.id}, this)"></span>
        `;

        // Add animation class
        bookItem.classList.add('hidden');
        bookList.appendChild(bookItem);

        // Trigger reflow for animation
        requestAnimationFrame(() => {
            bookItem.classList.remove('hidden');
        });
    });
}

// Setup pagination buttons
function setupPagination() {
    const totalPages = Math.ceil(books.length / booksPerPage);
    paginationDiv.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.classList.add('pagination-button');
        button.textContent = i;
        if (i === currentPage) button.classList.add('active');
        button.onclick = () => {
            currentPage = i;
            displayBooks();
            setupPagination();
        };
        paginationDiv.appendChild(button);
    }
}

// Wishlist Functionality
function toggleWishlist(bookId, iconElement) {
    if (wishlist.includes(bookId)) {
        wishlist = wishlist.filter(id => id !== bookId);
        iconElement.classList.remove('fas');
        iconElement.classList.add('far');
    } else {
        wishlist.push(bookId);
        iconElement.classList.remove('far');
        iconElement.classList.add('fas');
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

// Search and Filter Events
searchInput.addEventListener('input', () => {
    localStorage.setItem('searchTerm', searchInput.value);
    currentPage = 1;  // Reset to page 1 on new search
    displayBooks();
    setupPagination();
});

genreFilter.addEventListener('change', () => {
    localStorage.setItem('genre', genreFilter.value);
    currentPage = 1;  // Reset to page 1 on new filter
    displayBooks();
    setupPagination();
});

// Show Wishlist
document.getElementById('wishlistLink').addEventListener('click', () => {
    bookList.style.display = 'none';
    paginationDiv.style.display = 'none';
    wishlistPage.style.display = 'block';
    displayWishlist();
});

// Show Home
document.getElementById('homeLink').addEventListener('click', () => {
    wishlistPage.style.display = 'none';
    bookList.style.display = 'grid';
    paginationDiv.style.display = 'flex';
    displayBooks();
});

// Display Wishlist Books
function displayWishlist() {
    const wishlistBooks = books.filter(book => wishlist.includes(book.id));
    const wishlistDiv = document.getElementById('wishlistBooks');
    wishlistDiv.innerHTML = '';

    wishlistBooks.forEach(book => {
        const bookItem = document.createElement('div');
        bookItem.className = 'book-item';
        bookItem.dataset.id = book.id;

        bookItem.innerHTML = `
            <a href="book.html?id=${book.id}">
                <img src="${book.formats['image/jpeg']}" alt="${book.title}">
                <h3>${book.title}</h3>
            </a>
            <p>Author: ${book.authors.map(author => author.name).join(', ')}</p>
            <span class="love-icon ${wishlist.includes(book.id) ? 'fas' : 'far'} fa-heart" 
                  onclick="removeFromWishlist(${book.id}, this)"></span>
        `;

        wishlistDiv.appendChild(bookItem);
    });

    if (wishlistBooks.length === 0) {
        wishlistDiv.innerHTML = '<p>No books in your wishlist.</p>';
    }
}

// Remove from Wishlist (Instantly Disappear)
function removeFromWishlist(bookId, iconElement) {
    wishlist = wishlist.filter(id => id !== bookId);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    
    // Remove the book item from the wishlist display with animation
    const bookItem = iconElement.closest('.book-item');
    bookItem.classList.add('hidden');
    setTimeout(() => {
        bookItem.remove();
    }, 500); // Matches the CSS transition duration
}

// Initial Fetch
fetchBooks();
