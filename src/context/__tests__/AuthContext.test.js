import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

jest.mock('axios');

// Helper: build a fake JWT with a given payload (no real signing needed for client-side decode)
function makeToken(payload) {
    const encoded = btoa(JSON.stringify(payload));
    return `fakeheader.${encoded}.fakesig`;
}

// Helper component that exposes context values as text so tests can read them
function AuthDisplay() {
    const { user, token, isAdmin } = useAuth();
    return (
        <div>
            <span data-testid="user">{user ? user.displayName : 'none'}</span>
            <span data-testid="token">{token ?? 'none'}</span>
            <span data-testid="isAdmin">{String(isAdmin)}</span>
        </div>
    );
}

function AuthControls() {
    const { login, logout } = useAuth();
    return (
        <>
            <button onClick={() => login({ displayName: 'Alice' }, makeToken({ role: 'User' }))}>
                Login User
            </button>
            <button onClick={() => login({ displayName: 'Bob' }, makeToken({ role: 'Admin' }))}>
                Login Admin
            </button>
            <button onClick={logout}>Logout</button>
        </>
    );
}

function TestApp() {
    return (
        <AuthProvider>
            <AuthDisplay />
            <AuthControls />
        </AuthProvider>
    );
}

beforeEach(() => localStorage.clear());

// Before any login has happened, user and token should both be absent and isAdmin should be false
test('initial state is unauthenticated with isAdmin false', () => {
    render(<TestApp />);
    expect(screen.getByTestId('user').textContent).toBe('none');
    expect(screen.getByTestId('token').textContent).toBe('none');
    expect(screen.getByTestId('isAdmin').textContent).toBe('false');
});

// Calling login() should immediately make the user's display name and token available in the context
test('login sets user and token in context', () => {
    render(<TestApp />);
    act(() => screen.getByRole('button', { name: 'Login User' }).click());
    expect(screen.getByTestId('user').textContent).toBe('Alice');
    expect(screen.getByTestId('token').textContent).not.toBe('none');
});

// The token should be saved to localStorage so the session survives a page refresh
test('login persists token to localStorage', () => {
    render(<TestApp />);
    act(() => screen.getByRole('button', { name: 'Login User' }).click());
    expect(localStorage.getItem('token')).not.toBeNull();
});

// Logging out should wipe the user, token, and localStorage entry so no session data lingers
test('logout clears user, token, and localStorage', () => {
    render(<TestApp />);
    act(() => screen.getByRole('button', { name: 'Login User' }).click());
    act(() => screen.getByRole('button', { name: 'Logout' }).click());
    expect(screen.getByTestId('user').textContent).toBe('none');
    expect(screen.getByTestId('token').textContent).toBe('none');
    expect(localStorage.getItem('token')).toBeNull();
});

// A token that carries the User role should not grant admin access
test('isAdmin is false for a regular user token', () => {
    render(<TestApp />);
    act(() => screen.getByRole('button', { name: 'Login User' }).click());
    expect(screen.getByTestId('isAdmin').textContent).toBe('false');
});

// A token with the Admin role claim should cause isAdmin to be true, unlocking admin-only features
test('isAdmin is true when token contains the Admin role', () => {
    render(<TestApp />);
    act(() => screen.getByRole('button', { name: 'Login Admin' }).click());
    expect(screen.getByTestId('isAdmin').textContent).toBe('true');
});
