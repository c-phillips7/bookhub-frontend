import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Books from './pages/Books';
import Authors from './pages/Authors';
//import Genres from './pages/Genres';
import Reviews from './pages/Reviews';
import ReadingLists from './pages/ReadingLists';
import ReadingListDetails from './pages/ReadingListDetails';
import BookDetail from './pages/BookDetail';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Update from './pages/Update';
import User from './pages/User';

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
          <Route path="/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
          <Route path="/reading-lists" element={<ProtectedRoute><ReadingLists /></ProtectedRoute>} />
          <Route path="/reading-lists/:id" element={<ProtectedRoute><ReadingListDetails /></ProtectedRoute>} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/update" element={<AdminRoute><Update /></AdminRoute>} />
          <Route path="/users/:id" element={<User />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
