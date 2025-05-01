import './App.css';
import { useState, useEffect } from 'react';

function App() {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;
  
  // File upload state
  const [file, setFile] = useState(null);
  const [uploadedBooks, setUploadedBooks] = useState([]);
  
  useEffect(() => {
    if (query) {
      fetchBooks();
    }
  }, [currentPage, query]);

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${itemsPerPage}`
      );
      
      if (!response.ok) {
        throw new Error('Something went wrong with the API request');
      }
      
      const data = await response.json();
      
      setBooks(data.items || []);
      setTotalItems(data.totalItems || 0);
    } catch (err) {
      setError(err.message);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      setCurrentPage(1); // Reset to first page on new search
      fetchBooks();
    }
  };

  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Read file as text
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          // Parse file content - assuming JSON format with book data
          const books = JSON.parse(event.target.result);
          setUploadedBooks(Array.isArray(books) ? books : []);
        } catch (err) {
          setError('Failed to parse file. Please upload a valid JSON file with book data.');
          setUploadedBooks([]);
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const paginate = (direction) => {
    if (direction === 'next' && currentPage * itemsPerPage < totalItems) {
      setCurrentPage(currentPage + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Combine API books and uploaded books
  const displayedBooks = [...books, ...uploadedBooks];

  return (
    <div className="book-search-container">
      <h1 className="page-title">Book Search</h1>
      
      {/* Search Bar */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleInputKeyPress}
            placeholder="Search for books..."
            className="search-input"
          />
          <button
            onClick={handleSearch}
            className="search-button"
            aria-label="Search"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      </div>
      
      {/* File Upload (Optional feature) */}
      <div className="file-upload-container">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="book-icon">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
        <div className="file-upload-wrapper">
          <label htmlFor="file-upload" className="file-upload-label">
            Upload a book list (JSON format)
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden-input"
          />
          {file && <p className="file-name">Uploaded: {file.name}</p>}
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {/* Loading State */}
      {loading ? (
        <div className="loading-container">
          <div className="loader"></div>
          <span>Loading books...</span>
        </div>
      ) : (
        <>
          {/* Books List */}
          <div className="books-list">
            {displayedBooks.length > 0 ? (
              displayedBooks.map((book, index) => {
                // Handle both API results and uploaded books format
                const bookInfo = book.volumeInfo || book;
                const title = bookInfo.title || 'Unknown Title';
                const authors = bookInfo.authors ? bookInfo.authors.join(', ') : 'Unknown Author';
                const thumbnail = 
                  bookInfo.imageLinks?.thumbnail || 
                  'https://via.placeholder.com/120x180';
                
                return (
                  <div key={book.id || index} className="book-item">
                    <div className="book-thumbnail">
                      <img 
                        src={thumbnail} 
                        alt={`Cover for ${title}`}
                        className="book-cover"
                      />
                    </div>
                    <div className="book-details">
                      <h3 className="book-title">{title}</h3>
                      <p className="book-author">by {authors}</p>
                      <p className="book-description">
                        {bookInfo.description || 'No description available'}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : query ? (
              <div className="no-results">
                No books found. Try a different search term.
              </div>
            ) : (
              <div className="empty-state">
                Search for books to see results.
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {displayedBooks.length > 0 && (
            <div className="pagination">
              <button
                onClick={() => paginate('prev')}
                disabled={currentPage === 1}
                className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="chevron-icon">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                Previous
              </button>
              
              <span className="page-indicator">
                Page {currentPage} of {Math.ceil(totalItems / itemsPerPage) || 1}
              </span>
              
              <button
                onClick={() => paginate('next')}
                disabled={currentPage * itemsPerPage >= totalItems}
                className={`pagination-button ${currentPage * itemsPerPage >= totalItems ? 'disabled' : ''}`}
              >
                Next
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="chevron-icon">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;