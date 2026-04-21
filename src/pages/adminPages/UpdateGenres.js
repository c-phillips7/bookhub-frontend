import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/Api";
import LoadingSpinner from "../../components/LoadingSpinner";

function UpdateGenres() {
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get("/api/genres")
            .then((res) => setGenres(res.data))
            .catch(() => setError("Failed to load genres."))
            .finally(() => setLoading(false));
    }, []);

    const resetForm = () => {
        setEditingId(null);
        setName("");
        setFormError("");
    };

    const startEdit = (genre) => {
        setEditingId(genre.id);
        setName(genre.name);
        setFormError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");
        setSaving(true);
        try {
            if (editingId) {
                await api.put(`/api/genres/${editingId}`, { name });
                setGenres((prev) => prev.map((g) => g.id === editingId ? { ...g, name } : g)); // Update name in local state for immediate UI update
            } else {
                const res = await api.post("/api/genres", { name });
                setGenres((prev) => [...prev, res.data]);
            }
            resetForm();
        } catch {
            setFormError("Failed to save genre. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this genre?")) return;
        try {
            await api.delete(`/api/genres/${id}`);
            setGenres((prev) => prev.filter((g) => g.id !== id));
        } catch {
            setError("Failed to delete genre. Please try again.");
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <Link to="/update" className="btn btn-outline-secondary mb-4">&larr; Back to Admin Panel</Link>
            <h2 className="mb-4">Manage Genres</h2>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* Create / Edit form */}
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">{editingId ? "Edit Genre" : "New Genre"}</h5>
                    {formError && <div className="alert alert-danger py-1 px-3 small">{formError}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Name</label>
                            <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} required />
                        </div>
                        <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? "Saving..." : editingId ? "Save Changes" : "Create Genre"}
                            </button>
                            {editingId && (
                                <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>Cancel</button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Genres list */}
            {genres.length === 0 ? (
                <p className="text-muted">No genres found.</p>
            ) : (
                <div className="list-group">
                    {genres.map((genre) => (
                        <div key={genre.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <span className="fw-semibold">{genre.name}</span>
                            <div className="d-flex gap-2">
                                <button className="btn btn-sm btn-outline-primary" onClick={() => startEdit(genre)}>Edit</button>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(genre.id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default UpdateGenres;