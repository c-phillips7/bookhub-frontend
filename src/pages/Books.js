import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/Api";
import LoadingSpinner from "../components/LoadingSpinner";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";

const ITEMS_PER_PAGE = 12;

//TODO add interactive links to book details, author pages, genre pages on clicks. Maybe add ratings.
//TODO update book cards to show more info and look nicer, maybe add cover images if available
//TODO add an add to reading list button on book cards if logged in, or just leave that in BookDetail page for simplicity? 

function Books() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const [booksRes, genresRes] = await Promise.all([
                api.get('/api/books'),
                api.get('/api/genres')
            ]);
            setBooks(booksRes.data);
            setGenres(genresRes.data);
        } catch (err) {
            setError('Failed to load books. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // display filtered books based on search query, matching title, author name, or genres
    const filteredBooks = books
        .filter(book =>
            book.title.toLowerCase().includes(search.toLowerCase()) ||
            book.author?.name.toLowerCase().includes(search.toLowerCase())
        )
        .filter(book =>
            selectedGenre === '' ||
            book.genres?.some(g => g.toLowerCase() === selectedGenre.toLowerCase())
        );

    const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
    const displayedBooks = filteredBooks.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );


    if (loading) return <LoadingSpinner />;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Books</h2>
            </div>

            {books.length === 0 ? (
                <p>No books found.</p>
            ) : (
                <>
                    <SearchBar
                        value={search}
                        onChange={(val) => { setSearch(val); setCurrentPage(1); }}
                        placeholder="Search by title or author..."
                    />
                    <div className="mb-3">
                        <select
                            className="form-select"
                            value={selectedGenre}
                            onChange={(e) => { setSelectedGenre(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="">All Genres</option>
                            {genres.map((genre) => (
                                <option key={genre.id} value={genre.name}>
                                    {genre.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="row row-cols-1 row-cols-md-3 g-4">
                        {displayedBooks.map((book) => (
                            <div className="col" key={book.id}>
                                <div className="card h-100">
                                    <div className="card-body">
                                        <h5 className="card-title">
                                            <Link to={`/books/${book.id}`} className="text-decoration-none text-dark stretched-link">
                                                {book.title}
                                            </Link>
                                        </h5>
                                        <h6 className="card-subtitle mb-2 text-muted">
                                            {book.author?.name}
                                        </h6>
                                        <p className="card-text">{book.description}</p>
                                        {book.genres?.length > 0 && (
                                            <div>
                                                {book.genres.map((genre, index) => (
                                                    <span key={index} className="badge bg-secondary me-1">
                                                        {genre}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </>
            )}
        </div>
    );
}

export default Books;
