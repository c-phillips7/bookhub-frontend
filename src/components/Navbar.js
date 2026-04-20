import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { token, logout } = useAuth();
    const navigate = useNavigate();

    // Handle logout and redirect to login page
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
                <Link className="navbar-brand" to="/">BookHub</Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">Books</Link>
                        </li>
                        {token && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/authors">Authors</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/reviews">My Reviews</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/reading-lists">Reading Lists</Link>
                                </li>
                            </>
                        )}
                    </ul>

                    <ul className="navbar-nav">
                        {token ? (
                            <li className="nav-item">
                                <button className="btn btn-outline-light" onClick={handleLogout}>
                                    Logout
                                </button>  
                            </li>
                        ) : (
                            <>
                                <li className="nav-item me-2">
                                    <Link className="btn btn-outline-light" to="/login">Login</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="btn btn-outline-light" to="/register">Register</Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;