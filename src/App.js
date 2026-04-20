import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Books from './pages/Books';
import Authors from './pages/Authors';
import Genres from './pages/Genres';
import Reviews from './pages/Reviews';
import ReadingLists from './pages/ReadingLists';
import ProtectedRoute from './components/ProtectedRoute';

// react defailts
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Books />} />
          <Route path="/authors" element={<ProtectedRoute><Authors /></ProtectedRoute>} />
          <Route path="/genres" element={<ProtectedRoute><Genres /></ProtectedRoute>} />
          <Route path="/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
          <Route path="/reading-lists" element={<ProtectedRoute><ReadingLists /></ProtectedRoute>} />
        </Routes>
      </div>
    </>
  );
}

export default App;
