import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/Api";
import LoadingSpinner from "../../components/LoadingSpinner";
import Pagination from "../../components/Pagination";
import SearchBar from "../../components/SearchBar";

const ITEMS_PER_PAGE = 10;

function UpdateBooks() {
    const [books, setBooks] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [authorId, setAuthorId] = useState("");
    const [selectedGenreIds, setSelectedGenreIds] = useState([]);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // get all books, authors, and genres for form dropdowns and display
    useEffect(() => {
        Promise.all([
            api.get("/api/books"),
            api.get("/api/authors"),
            api.get("/api/genres"),
        ])
            .then(([booksRes, authorsRes, genresRes]) => {
                setBooks(booksRes.data);
                setAuthors(authorsRes.data);
                setGenres(genresRes.data);
                if (authorsRes.data.length > 0) setAuthorId(authorsRes.data[0].id);
            })
            .catch(() => setError("Failed to load data."))
            .finally(() => setLoading(false));
    }, []);

    // Reset form to initial state
    const resetForm = () => {
        setEditingId(null);
        setTitle("");
        setDescription("");
        setAuthorId(authors[0]?.id ?? "");
        setSelectedGenreIds([]);
        setFormError("");
    };

    // Populate form with book data for editing
    const startEdit = (book) => {
        setEditingId(book.id);
        setTitle(book.title);
        setDescription(book.description ?? "");
        setAuthorId(book.author?.id ?? authors[0]?.id ?? "");
        // genres on the book list are strings (names); match to IDs
        const ids = book.genres
            ?.map((gName) => genres.find((g) => g.name === gName)?.id)
            .filter(Boolean) ?? [];
        setSelectedGenreIds(ids);
        setFormError("");
    };

    // Toggle genre selection in form
    const toggleGenre = (id) => {
        setSelectedGenreIds((prev) =>
            prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");
        setSaving(true);
        const body = { title, description, authorId: parseInt(authorId), genreIds: selectedGenreIds };
        try {
            if (editingId) {
                await api.put(`/api/books/${editingId}`, body);
                // Refresh full list to get updated genre names
                const res = await api.get("/api/books");
                setBooks(res.data);
            } else {
                const res = await api.post("/api/books", body);
                setBooks((prev) => [...prev, res.data]);
            }
            resetForm();
        } catch {
            setFormError("Failed to save book. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this book? This will also remove it from all reading lists.")) return;
        try {
            await api.delete(`/api/books/${id}`);
            setBooks((prev) => prev.filter((b) => b.id !== id));
        } catch {
            setError("Failed to delete book. Please try again.");
        }
    };

    const filteredBooks = books
        .filter((b) =>
            b.title.toLowerCase().includes(search.toLowerCase()) ||
            b.author?.name.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => a.title.localeCompare(b.title));
    const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
    const displayedBooks = filteredBooks.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <Link to="/update" className="btn btn-outline-secondary mb-4">&larr; Back to Admin Panel</Link>
            <h2 className="mb-4">Manage Books</h2>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* Create / Edit form */}
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">{editingId ? "Edit Book" : "New Book"}</h5>
                    {formError && <div className="alert alert-danger py-1 px-3 small">{formError}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Title</label>
                            <input className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={300} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Description <span className="text-muted fw-normal">(optional)</span></label>
                            <textarea className="form-control" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Author</label>
                            <select className="form-select" value={authorId} onChange={(e) => setAuthorId(e.target.value)} required>
                                {[...authors].sort((a, b) => a.name.localeCompare(b.name)).map((a) => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Genres</label>
                            <div className="d-flex flex-wrap gap-2">
                                {genres.map((g) => (
                                    <div key={g.id} className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id={`genre-${g.id}`}
                                            checked={selectedGenreIds.includes(g.id)}
                                            onChange={() => toggleGenre(g.id)}
                                        />
                                        <label className="form-check-label" htmlFor={`genre-${g.id}`}>{g.name}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? "Saving..." : editingId ? "Save Changes" : "Create Book"}
                            </button>
                            {editingId && (
                                <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>Cancel</button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Books list */}
            <SearchBar
                value={search}
                onChange={(val) => { setSearch(val); setCurrentPage(1); }}
                placeholder="Search by title or author..."
            />
            {filteredBooks.length === 0 ? (
                <p className="text-muted">No books found.</p>
            ) : (
                <div className="list-group">
                    {displayedBooks.map((book) => (
                        <div key={book.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                                <span className="fw-semibold">{book.title}</span>
                                <span className="ms-2 text-muted small">by {book.author?.name ?? "Unknown"}</span>
                                {book.genres?.length > 0 && (
                                    <div className="mt-1">
                                        {book.genres.map((g, i) => (
                                            <span key={i} className="badge bg-secondary me-1">{g}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="d-flex gap-2 ms-3 flex-shrink-0">
                                <button className="btn btn-sm btn-outline-primary" onClick={() => startEdit(book)}>Edit</button>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(book.id)}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
    );
}

export default UpdateBooks;