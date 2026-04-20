import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/Api";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

function BookDetail() {
    const { id } = useParams();
    const { token, user } = useAuth();

    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Reading list states for the "Add to Reading List" feature
    const [readingLists, setReadingLists] = useState([]);
    const [selectedListId, setSelectedListId] = useState("");
    const [adding, setAdding] = useState(false);
    const [addSuccess, setAddSuccess] = useState("");
    const [addError, setAddError] = useState("");

    // Review states
    const [reviews, setReviews] = useState([]);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewContent, setReviewContent] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewError, setReviewError] = useState("");
    const [reviewSuccess, setReviewSuccess] = useState("");

    // Fetch book details on mount
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

    // Fetch user's reading lists if logged in, to populate the "Add to Reading List" options
    useEffect(() => {
        if (!token) return;
        api.get("/api/readinglists/my")
            .then((res) => {
                setReadingLists(res.data);
                if (res.data.length > 0) setSelectedListId(res.data[0].id);
            })
            .catch(() => {});
    }, [token]);

    // Fetch reviews for this book
    useEffect(() => {
        api.get(`/api/reviews/book/${id}`)
            .then((res) => setReviews(res.data))
            .catch(() => {});
    }, [id]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        setReviewError("");
        setReviewSuccess("");
        setSubmittingReview(true);
        try {
            const res = await api.post("/api/reviews", {
                bookId: parseInt(id),
                rating: reviewRating,
                content: reviewContent.trim() || null,
            });
            setReviews((prev) => [res.data, ...prev]);
            setReviewRating(5);
            setReviewContent("");
            setReviewSuccess("Review submitted!");
        } catch (err) {
            setReviewError("Failed to submit review. Please try again.");
        } finally {
            setSubmittingReview(false);
        }
    };

    // Handle deleting a review — only allow if the current user is the author of the review
    const handleDeleteReview = async (reviewId) => {
        try {
            await api.delete(`/api/reviews/${reviewId}`);
            setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        } catch (err) {
            setReviewError("Failed to delete review. Please try again.");
        }
    };

    const bookId = parseInt(id);
    const selectedList = readingLists.find((l) => l.id === selectedListId);
    // Check if the book is already in the selected reading list to disable the add button and show appropriate text
    const alreadyInSelectedList = selectedList?.items?.some((item) => item.bookId === bookId) ?? false;

    // Handle adding the book to the selected reading list
    const handleAddToList = async () => {
        if (!selectedListId || alreadyInSelectedList) return;
        setAdding(true);
        setAddError("");
        setAddSuccess("");
        try {
            await api.post(`/api/readinglists/${selectedListId}/items`, {
                bookId,
            });
            const listName = selectedList?.name;
            setAddSuccess(`Added to "${listName}".`);
            // Update local list state so the button disables immediately without a refetch
            setReadingLists((prev) =>
                prev.map((l) =>
                    l.id === selectedListId
                        ? { ...l, items: [...(l.items ?? []), { bookId }] }
                        : l
                )
            );
        } catch (err) {
            if (err.response?.status === 409) {
                setAddError("This book is already in that list.");
            } else {
                setAddError("Failed to add book. Please try again.");
            }
        } finally {
            setAdding(false);
        }
    };

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
                        <h5 className="text-muted mb-3">by {book.author.name}</h5>
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

                    {/* Add to reading list — only shown when logged in */}
                    {token && (
                        <div className="mt-4">
                            <h6>Add to Reading List</h6>
                            {readingLists.length === 0 ? (
                                <p className="text-muted small">
                                    You have no reading lists.{" "}
                                    <Link to="/reading-lists">Create one</Link> first.
                                </p>
                            ) : (
                                <div className="d-flex gap-2 align-items-center flex-wrap">
                                    <select
                                        className="form-select w-auto"
                                        value={selectedListId}
                                        onChange={(e) => {
                                            setSelectedListId(parseInt(e.target.value));
                                            setAddSuccess("");
                                            setAddError("");
                                        }}
                                    >
                                        {readingLists.map((list) => (
                                            <option key={list.id} value={list.id}>
                                                {list.name}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleAddToList}
                                        disabled={adding || alreadyInSelectedList}
                                    >
                                        {adding ? "Adding..." : alreadyInSelectedList ? "Already Added" : "+ Add"}
                                    </button>
                                </div>
                            )}
                            {addSuccess && (
                                <div className="alert alert-success mt-2 py-1 px-3 small">{addSuccess}</div>
                            )}
                            {addError && (
                                <div className="alert alert-danger mt-2 py-1 px-3 small">{addError}</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Reviews section */}
            {/* TODO make section collapsible */}

            <hr className="my-4" />
            <h4 className="mb-3">Reviews</h4>

            {token && (
                <div className="card mb-4">
                    <div className="card-body">
                        <h6 className="card-title">Leave a Review</h6>
                        {reviewError && <div className="alert alert-danger py-1 px-3 small">{reviewError}</div>}
                        {reviewSuccess && <div className="alert alert-success py-1 px-3 small">{reviewSuccess}</div>}
                        <form onSubmit={handleSubmitReview}>
                            <div className="mb-3">
                                <label className="form-label">Rating</label>
                                <select
                                    className="form-select w-auto"
                                    value={reviewRating}
                                    onChange={(e) => setReviewRating(parseInt(e.target.value))}
                                >
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <option key={n} value={n}>{n} / 5</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">
                                    Review <span className="text-muted fw-normal"></span>
                                </label>
                                <textarea
                                    className="form-control"
                                    rows={3}
                                    maxLength={5000}
                                    value={reviewContent}
                                    onChange={(e) => setReviewContent(e.target.value)}
                                    placeholder="Share your thoughts..."
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                                {submittingReview ? "Submitting..." : "Submit Review"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {reviews.length === 0 ? (
                <p className="text-muted">No reviews yet. Be the first!</p>
            ) : (
                <div className="list-group">
                    {reviews.map((review) => (
                        <div key={review.id} className="list-group-item">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="fw-semibold">{review.user?.displayName ?? "User"}</span>
                                <div className="d-flex align-items-center gap-2">
                                    <span className="badge bg-primary">{review.rating} / 5</span>
                                    {user?.id === review.user?.id && (
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDeleteReview(review.id)}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                            {review.content && (
                                <p className="mb-0 text-muted">{review.content}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default BookDetail;
