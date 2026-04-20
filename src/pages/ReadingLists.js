import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/Api";
import LoadingSpinner from "../components/LoadingSpinner";

function ReadingLists() {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Create form state
    const [showForm, setShowForm] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newIsPublic, setNewIsPublic] = useState(false);
    const [creating, setCreating] = useState(false);
    // Extra error state for form submission errors to avoid overwriting the main error state used for fetching lists
    const [formError, setFormError] = useState("");

    useEffect(() => {
        fetchLists();
    }, []);

    const fetchLists = async () => {
        try {
            const res = await api.get("/api/readinglists/my");
            setLists(res.data);
        } catch (err) {
            setError("Failed to load reading lists. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Handle creating a new reading list
    const handleCreate = async (e) => {
        e.preventDefault();
        setFormError("");
        setCreating(true);
        try {
            const res = await api.post("/api/readinglists", {
                name: newName,
                description: newDescription,
                isPublic: newIsPublic,
            });
            setLists((prev) => [...prev, res.data]);
            setNewName("");
            setNewDescription("");
            setNewIsPublic(false);
            setShowForm(false);
        } catch (err) {
            setFormError("Failed to create reading list. Please try again.");
        } finally {
            setCreating(false);
        }
    };

    // Handle deleting a reading list
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this reading list?")) return;
        try {
            await api.delete(`/api/readinglists/${id}`);
            setLists((prev) => prev.filter((l) => l.id !== id));
        } catch (err) {
            setError("Failed to delete reading list. Please try again.");
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>My Reading Lists</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowForm((v) => !v)}
                >
                    {showForm ? "Cancel" : "+ New List"}
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {showForm && (
                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="card-title">Create New List</h5>
                        {formError && <div className="alert alert-danger">{formError}</div>}
                        <form onSubmit={handleCreate}>
                            <div className="mb-3">
                                <label className="form-label">Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    maxLength={200}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Description <span className="text-muted">(optional)</span></label>
                                <textarea
                                    className="form-control"
                                    rows={3}
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    maxLength={2000}
                                />
                            </div>
                            <div className="mb-3 form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="isPublic"
                                    checked={newIsPublic}
                                    onChange={(e) => setNewIsPublic(e.target.checked)}
                                />
                                <label className="form-check-label" htmlFor="isPublic">
                                    Make this list public
                                </label>
                            </div>
                            <button type="submit" className="btn btn-success" disabled={creating}>
                                {creating ? "Creating..." : "Create"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {lists.length === 0 ? (
                <p className="text-muted">You have no reading lists yet. Create one to get started!</p>
            ) : (
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {lists.map((list) => (
                        <div className="col" key={list.id}>
                            <div className="card h-100">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <h5 className="card-title mb-1">
                                            <Link
                                                to={`/reading-lists/${list.id}`}
                                                className="text-decoration-none text-dark stretched-link"
                                            >
                                                {list.name}
                                            </Link>
                                        </h5>
                                        {list.isPublic ? (
                                            <span className="badge bg-success ms-2 flex-shrink-0">Public</span>
                                        ) : (
                                            <span className="badge bg-secondary ms-2 flex-shrink-0">Private</span>
                                        )}
                                    </div>
                                    {list.description && (
                                        <p className="card-text text-muted small mt-2">{list.description}</p>
                                    )}
                                    <p className="card-text mt-2">
                                        <small className="text-muted">
                                            {list.items?.length ?? 0} {list.items?.length === 1 ? "book" : "books"}
                                        </small>
                                    </p>
                                </div>
                                <div className="card-footer d-flex justify-content-end">
                                    <button
                                        className="btn btn-sm btn-outline-danger position-relative"
                                        style={{ zIndex: 1 }}
                                        onClick={() => handleDelete(list.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ReadingLists;
