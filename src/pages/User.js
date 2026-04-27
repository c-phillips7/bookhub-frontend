import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/Api";
import LoadingSpinner from "../components/LoadingSpinner";

function User() {
    const { id } = useParams();

    const [profile, setProfile] = useState(null);
    const [lists, setLists] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch public version of user profile, public reading lists, and reviews
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [profileRes, listsRes, reviewsRes] = await Promise.all([
                    api.get(`/api/account/users/${id}`),
                    api.get(`/api/readinglists/user/${id}`),
                    api.get(`/api/reviews/user/${id}`),
                ]);
                setProfile(profileRes.data);
                setLists(listsRes.data);
                setReviews(reviewsRes.data);
            } catch {
                setError("Failed to load user profile. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [id]);

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!profile) return null;

    return (
        <div>
            <h2 className="mb-4">{profile.displayName}</h2>

            {/* Public Reading Lists */}
            <h4 className="mb-3">Reading Lists</h4>
            {lists.length === 0 ? (
                <p className="text-muted mb-4">No public reading lists.</p>
            ) : (
                <div className="row row-cols-1 row-cols-md-2 g-3 mb-5">
                    {lists.map((list) => (
                        <div className="col" key={list.id}>
                            <div className="card h-100">
                                <div className="card-body">
                                    <h5 className="card-title">{list.name}</h5>
                                    {list.description && (
                                        <p className="card-text text-muted small">{list.description}</p>
                                    )}
                                    <p className="card-text small">
                                        {list.items?.length ?? 0} book{list.items?.length !== 1 ? "s" : ""}
                                    </p>
                                    {list.items?.length > 0 && (
                                        <ul className="list-unstyled mb-0">
                                            {list.items.slice(0, 5).map((item) => (
                                                <li key={item.id}>
                                                    <Link to={`/books/${item.bookId}`} className="text-decoration-none small">
                                                        {item.book?.title ?? `Book #${item.bookId}`}
                                                    </Link>
                                                </li>
                                            ))}
                                            {list.items.length > 5 && (
                                                <li className="text-muted small mt-1">
                                                    +{list.items.length - 5} more
                                                </li>
                                            )}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Reviews */}
            <h4 className="mb-3">Reviews</h4>
            {reviews.length === 0 ? (
                <p className="text-muted">No reviews yet.</p>
            ) : (
                <div className="list-group">
                    {reviews.map((review) => (
                        <div key={review.id} className="list-group-item mb-2">
                            <div className="d-flex justify-content-between align-items-start">
                                <h5 className="mb-1">
                                    <Link to={`/books/${review.book?.id}`} className="text-decoration-none">
                                        {review.book?.title ?? "Unknown Book"}
                                    </Link>
                                </h5>
                                <span className="badge bg-primary">{review.rating} / 5</span>
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

export default User;
