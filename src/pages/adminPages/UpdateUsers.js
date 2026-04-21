import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/Api";
import LoadingSpinner from "../../components/LoadingSpinner";

function UpdateUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get("/api/account/users")
            .then((res) => setUsers(res.data))
            .catch(() => setError("Failed to load users."))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id, displayName) => {
        // Confirm deletion with user!!!
        if (!window.confirm(`Delete user "${displayName}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/api/account/${id}`);
            setUsers((prev) => prev.filter((u) => u.id !== id));
        } catch {
            setError("Failed to delete user. Please try again.");
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <Link to="/update" className="btn btn-outline-secondary mb-4">&larr; Back to Admin Panel</Link>
            <h2 className="mb-4">Manage Users</h2>

            {error && <div className="alert alert-danger">{error}</div>}

            {users.length === 0 ? (
                <p className="text-muted">No users found.</p>
            ) : (
                <div className="list-group">
                    {users.map((user) => (
                        <div key={user.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                                <span className="fw-semibold">{user.displayName}</span>
                                <span className="ms-2 text-muted small">{user.email}</span>
                                <span className="ms-2 text-muted small">
                                    Joined {new Date(user.dateJoined).toLocaleDateString()}
                                </span>
                            </div>
                            <button
                                className="btn btn-sm btn-outline-danger ms-3"
                                onClick={() => handleDelete(user.id, user.displayName)}
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default UpdateUsers;