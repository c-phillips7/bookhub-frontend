import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/Api";
import LoadingSpinner from "../components/LoadingSpinner";

function Reviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleteError, setDeleteError] = useState("");

    useEffect(() => {
        api.get("/api/reviews/my")
            .then((res) => setReviews(res.data))
            .catch(() => setError("Failed to load reviews. Please try again."))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (reviewId) => {
        if (!window.confirm("Delete this review?")) return;
        setDeleteError("");
        try {
            await api.delete(`/api/reviews/${reviewId}`);
            setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        } catch {
            setDeleteError("Failed to delete review. Please try again.");
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div>
            <h2 className="mb-4">My Reviews</h2>

            {deleteError && (
                <div className="alert alert-danger">{deleteError}</div>
            )}

            {reviews.length === 0 ? (
                <p className="text-muted">
                    You haven't reviewed any books yet.{" "}
                    <Link to="/">Browse books</Link> to leave a review.
                </p>
            ) : (
                <div className="list-group">
                    {reviews.map((review) => (
                        <div key={review.id} className="list-group-item mb-2">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <h5 className="mb-1">
                                        <Link
                                            to={`/books/${review.book?.id}`}
                                            className="text-decoration-none"
                                        >
                                            {review.book?.title ?? "Unknown Book"}
                                        </Link>
                                    </h5>
                                    <span className="badge bg-primary me-2">{review.rating} / 5</span>
                                </div>
                                <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDelete(review.id)}
                                >
                                    Delete
                                </button>
                            </div>
                            {review.content && (
                                <p className="mt-2 mb-0 text-muted">{review.content}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Reviews;
