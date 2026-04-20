import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/Api";
import LoadingSpinner from "../components/LoadingSpinner";

function BookDetail() {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const res = await api.get(`/api/books/${id}`);
                setBook(res.data);
            } catch (err) {
                setError("Failed to load book details. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchBook();
    }, [id]);

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!book) return null;

    return (
        <div>
            <Link to="/" className="btn btn-outline-secondary mb-4">&larr; Back to Books</Link>

            <div className="row">
                {/* Cover image column — shown when coverImageUrl is available */}
                {book.coverImageUrl && (
                    <div className="col-md-3 mb-4">
                        <img
                            src={book.coverImageUrl}
                            alt={`Cover of ${book.title}`}
                            className="img-fluid rounded shadow"
                        />
                    </div>
                )}

                <div className={book.coverImageUrl ? "col-md-9" : "col-12"}>
                    <h2>{book.title}</h2>

                    {book.author && (
                        <h5 className="text-muted mb-3">
                            by {book.author.name}
                        </h5>
                    )}

                    {book.genres?.length > 0 && (
                        <div className="mb-3">
                            {book.genres.map((genre, index) => (
                                <span key={index} className="badge bg-secondary me-1">
                                    {genre}
                                </span>
                            ))}
                        </div>
                    )}

                    {book.description && (
                        <p className="lead">{book.description}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BookDetail;
