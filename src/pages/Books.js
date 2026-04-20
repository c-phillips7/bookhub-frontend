import { useState, useEffect } from "react";
import api from "../services/Api";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import Pagination from "../components/Pagination";

const ITEMS_PER_PAGE = 12;

//TODO add search and filter functionality
//TODO add interactive links to book details, author pages, genre pages, etc.
//TODO update book cards to show more info and look nicer, maybe add cover images if available

function Books() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const { token } = useAuth();

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const response = await api.get("/api/books");
            setBooks(response.data);
        } catch (err) {
            setError("Failed to load books. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(books.length / ITEMS_PER_PAGE);
    const displayedBooks = books.slice(
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
                    <div className="row row-cols-1 row-cols-md-3 g-4">
                        {displayedBooks.map((book) => (
                            <div className="col" key={book.id}>
                                <div className="card h-100">
                                    <div className="card-body">
                                        <h5 className="card-title">{book.title}</h5>
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
