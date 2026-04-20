import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/Api";
import LoadingSpinner from "../components/LoadingSpinner";

function ReadingListDetails() {
    const { id } = useParams();

    const [list, setList] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Pending edit state — mirrors the list fields until confirmed
    const [pendingName, setPendingName] = useState("");
    const [pendingDescription, setPendingDescription] = useState("");
    const [pendingIsPublic, setPendingIsPublic] = useState(false);
    // Set of item IDs staged for removal
    const [pendingRemovals, setPendingRemovals] = useState(new Set());

    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");

    const loadList = useCallback(async () => {
        try {
            const res = await api.get(`/api/readinglists/${id}`);
            setList(res.data);
            setPendingName(res.data.name);
            setPendingDescription(res.data.description ?? "");
            setPendingIsPublic(res.data.isPublic);
            setPendingRemovals(new Set());
        } catch (err) {
            setError("Failed to load reading list. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadList();
    }, [loadList]);

    // Determine if any metadata fields have changed compared to the original list
    const metadataChanged =
        list &&
        (pendingName !== list.name ||
            pendingDescription !== (list.description ?? "") ||
            pendingIsPublic !== list.isPublic);

    // The list is considered "dirty" if either metadata has changed or there are pending item removals
    const isDirty = metadataChanged || pendingRemovals.size > 0;

    // When user clicks "Remove" on an item, stage it for removal but don't immediately call the API
    const handleStageRemoval = (itemId) => {
        setPendingRemovals((prev) => {
            const next = new Set(prev);
            next.add(itemId);
            return next;
        });
    };

    // Allow undoing a staged removal before confirming changes
    const handleUndoRemoval = (itemId) => {
        setPendingRemovals((prev) => {
            const next = new Set(prev);
            next.delete(itemId);
            return next;
        });
    };

    // Discard all pending changes and reset to last saved state
    const handleDiscard = () => {
        if (!list) return;
        setPendingName(list.name);
        setPendingDescription(list.description ?? "");
        setPendingIsPublic(list.isPublic);
        setPendingRemovals(new Set());
        setSaveError("");
    };

    // When user confirms changes, send API requests to update metadata and remove items as needed
    const handleConfirm = async () => {
        setSaveError("");
        setSaving(true);
        try {
            // Update metadata only if something changed
            if (metadataChanged) {
                await api.put(`/api/readinglists/${id}`, {
                    name: pendingName,
                    description: pendingDescription,
                    isPublic: pendingIsPublic,
                });
            }

            // Delete each staged removal
            await Promise.all(
                [...pendingRemovals].map((itemId) =>
                    api.delete(`/api/readinglists/${id}/items/${itemId}`)
                )
            );

            // Refresh from API to get clean state
            await loadList();
        } catch (err) {
            setSaveError("Failed to save changes. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!list) return null;

    const visibleItems = list.items ?? [];

    return (
        <div className="pb-5">
            <Link to="/reading-lists" className="btn btn-outline-secondary mb-4">
                &larr; Back to Reading Lists
            </Link>

            {/* Details edit section */}
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title mb-3">List Details</h5>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={pendingName}
                            onChange={(e) => setPendingName(e.target.value)}
                            maxLength={200}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">
                            Description{" "}
                            <span className="text-muted fw-normal">(optional)</span>
                        </label>
                        <textarea
                            className="form-control"
                            rows={3}
                            value={pendingDescription}
                            onChange={(e) => setPendingDescription(e.target.value)}
                            maxLength={2000}
                        />
                    </div>
                    <div className="form-check">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="pendingIsPublic"
                            checked={pendingIsPublic}
                            onChange={(e) => setPendingIsPublic(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="pendingIsPublic">
                            Make this list public
                        </label>
                    </div>
                </div>
            </div>

            {/* Books section */}
            <h5 className="mb-3">
                Books{" "}
                <span className="text-muted fw-normal fs-6">
                    ({visibleItems.length - pendingRemovals.size} of {visibleItems.length})
                </span>
            </h5>

            {visibleItems.length === 0 ? (
                <p className="text-muted">No books in this list yet.</p>
            ) : (
                <div className="list-group mb-4">
                    {visibleItems.map((item) => {
                        const staged = pendingRemovals.has(item.id);
                        return (
                            <div
                                key={item.id}
                                className={`list-group-item d-flex justify-content-between align-items-center ${staged ? "list-group-item-danger" : ""}`}
                            >
                                <div className={staged ? "text-decoration-line-through text-muted" : ""}>
                                    <span className="fw-semibold">
                                        {staged ? (
                                            item.book?.title ?? `Book #${item.bookId}`
                                        ) : (
                                            <Link to={`/books/${item.bookId}`} className="text-decoration-none text-dark">
                                                {item.book?.title ?? `Book #${item.bookId}`}
                                            </Link>
                                        )}
                                    </span>
                                    <span className="ms-2 text-muted small">
                                        Added {new Date(item.dateAdded).toLocaleDateString()}
                                    </span>
                                </div>
                                {staged ? (
                                    <button
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => handleUndoRemoval(item.id)}
                                    >
                                        Undo
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleStageRemoval(item.id)}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Sticky confirm bar — only visible when there are pending changes */}
            {isDirty && (
                <div
                    className="position-fixed bottom-0 start-0 end-0 bg-white border-top shadow p-3 d-flex justify-content-between align-items-center"
                    style={{ zIndex: 1050 }}
                >
                    <span className="text-muted small">You have unsaved changes.</span>
                    {saveError && (
                        <span className="text-danger small me-auto ms-3">{saveError}</span>
                    )}
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-outline-secondary"
                            onClick={handleDiscard}
                            disabled={saving}
                        >
                            Discard
                        </button>
                        <button
                            className="btn btn-success"
                            onClick={handleConfirm}
                            disabled={saving || !pendingName.trim()}
                        >
                            {saving ? "Saving..." : "Confirm Changes"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReadingListDetails;
