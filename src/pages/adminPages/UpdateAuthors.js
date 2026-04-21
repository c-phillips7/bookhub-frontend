import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/Api";
import LoadingSpinner from "../../components/LoadingSpinner";
import Pagination from "../../components/Pagination";
import SearchBar from "../../components/SearchBar";

const ITEMS_PER_PAGE = 10;

function UpdateAuthors() {
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        api.get("/api/authors")
            .then((res) => setAuthors(res.data))
            .catch(() => setError("Failed to load authors."))
            .finally(() => setLoading(false));
    }, []);

    const resetForm = () => {
        setEditingId(null);
        setName("");
        setBio("");
        setFormError("");
    };

    const startEdit = (author) => {
        setEditingId(author.id);
        setName(author.name);
        setBio(author.bio ?? "");
        setFormError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");
        setSaving(true);
        const body = { name, bio };
        try {
            if (editingId) {
                await api.put(`/api/authors/${editingId}`, body);
                setAuthors((prev) => prev.map((a) => a.id === editingId ? { ...a, name, bio } : a));
            } else {
                const res = await api.post("/api/authors", body);
                setAuthors((prev) => [...prev, res.data]);
            }
            resetForm();
        } catch {
            setFormError("Failed to save author. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this author? This may affect associated books.")) return;
        try {
            await api.delete(`/api/authors/${id}`);
            setAuthors((prev) => prev.filter((a) => a.id !== id));
        } catch {
            setError("Failed to delete author. Please try again.");
        }
    };

    const filteredAuthors = authors
        .filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));
    const totalPages = Math.ceil(filteredAuthors.length / ITEMS_PER_PAGE);
    const displayedAuthors = filteredAuthors.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <Link to="/update" className="btn btn-outline-secondary mb-4">&larr; Back to Admin Panel</Link>
            <h2 className="mb-4">Manage Authors</h2>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* Create / Edit form */}
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">{editingId ? "Edit Author" : "New Author"}</h5>
                    {formError && <div className="alert alert-danger py-1 px-3 small">{formError}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Name</label>
                            <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} maxLength={200} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Bio <span className="text-muted fw-normal">(optional)</span></label>
                            <textarea className="form-control" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} maxLength={2000} />
                        </div>
                        <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? "Saving..." : editingId ? "Save Changes" : "Create Author"}
                            </button>
                            {editingId && (
                                <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>Cancel</button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Authors list */}
            <SearchBar
                value={search}
                onChange={(val) => { setSearch(val); setCurrentPage(1); }}
                placeholder="Search by name..."
            />
            {filteredAuthors.length === 0 ? (
                <p className="text-muted">No authors found.</p>
            ) : (
                <div className="list-group">
                    {displayedAuthors.map((author) => (
                        <div key={author.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                                <span className="fw-semibold">{author.name}</span>
                                {author.bio && <p className="mb-0 text-muted small">{author.bio}</p>}
                            </div>
                            <div className="d-flex gap-2 ms-3 flex-shrink-0">
                                <button className="btn btn-sm btn-outline-primary" onClick={() => startEdit(author)}>Edit</button>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(author.id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
    );
}

export default UpdateAuthors;