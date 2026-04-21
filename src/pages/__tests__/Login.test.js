import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Login from '../Login';
import api from '../../services/Api';

jest.mock('../../services/Api', () => ({
    get: jest.fn(),
    post: jest.fn(),
}));

// react-router-dom's useNavigate requires a Router context
function renderLogin() {
    return render(
        <AuthProvider>
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        </AuthProvider>
    );
}

beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
});

// Check the form has all the inputs and the submit button a user would expect to see
test('renders email field, password field, and login button', () => {
    renderLogin();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
});

// If the API rejects the credentials, the error message should be displayed to the user
test('shows an error alert when login fails', async () => {
    api.post.mockRejectedValueOnce({ response: { data: 'Invalid credentials' } });

    renderLogin();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'bad@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() =>
        expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials')
    );
});

// While waiting for the API response, the button should be disabled and show a loading label to prevent double submission
test('button shows "Logging in..." while the request is in flight', async () => {
    // Return a promise that never resolves so the loading state stays visible
    api.post.mockReturnValueOnce(new Promise(() => {}));

    renderLogin();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByRole('button', { name: /logging in/i })).toBeDisabled();
});

// Submitting the form should send exactly what the user typed to the correct API endpoint
test('calls the login API with the entered email and password', async () => {
    api.post.mockResolvedValueOnce({ data: { token: 'tok' } });
    api.get.mockResolvedValueOnce({ data: { id: '1', displayName: 'Alice' } });

    renderLogin();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'alice@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() =>
        expect(api.post).toHaveBeenCalledWith('/api/account/login', {
            email: 'alice@test.com',
            password: 'secret',
        })
    );
});
