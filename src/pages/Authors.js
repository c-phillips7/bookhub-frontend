import { useState, useEffect } from 'react';
import api from '../services/Api';
import LoadingSpinner from '../components/LoadingSpinner';

function Authors() {
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');


    useEffect(() => {
        fetchAuthors();
    }, []);

    const fetchAuthors = async () => {
        try {
            const response = await api.get('/api/authors');
            setAuthors(response.data);
        } catch (err) {
            setError('Failed to load authors. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Authors</h2>
            </div>

            {authors.length === 0 ? (
                <p>No authors found.</p>
            ) : (
                <div className="accordion" id="authorsAccordion">
                    {authors.map((author) => (
                        <div className="accordion-item" key={author.id}>
                            <h2 className="accordion-header">
                                <button
                                    className="accordion-button collapsed"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#author-${author.id}`}
                                >
                                    {author.name}
                                </button>
                            </h2>
                            <div
                                id={`author-${author.id}`}
                                className="accordion-collapse collapse"
                                data-bs-parent="#authorsAccordion"
                            >
                                <div className="accordion-body">
                                    <p>{author.bio || 'No bio available.'}</p>
                                    {author.books?.length > 0 && (
                                        <>
                                            <h6>Books:</h6>
                                            <ul>
                                                {author.books.map((book) => (
                                                    <li key={book.id}>{book.title}</li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

    );
}

export default Authors;