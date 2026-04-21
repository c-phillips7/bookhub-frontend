import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App';

// Mock API module to prevent actual HTTP requests during tests
jest.mock('./services/Api', () => ({
    get: jest.fn(() => Promise.resolve({ data: [] })),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
}));

// Basic smoke test to ensure App component renders without crashing
function renderApp(route = '/') {
    return render(
        <AuthProvider>
            <MemoryRouter initialEntries={[route]}>
                <App />
            </MemoryRouter>
        </AuthProvider>
    );
}

  //--------//
 // Tests //
//--------//

test('renders without crashing', async () => {
    renderApp('/');
    await waitFor(() => expect(document.body).toBeInTheDocument());
});

test('shows login link in navbar when not authenticated', async () => {
    renderApp('/');
    await waitFor(() =>
        expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument()
    );
});

test('navigating to /login renders the login form', async () => {
    renderApp('/login');
    await waitFor(() =>
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
    );
});
