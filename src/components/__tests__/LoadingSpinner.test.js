import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';


// Check that the LoadingSpinner component renders with accessible loading text
test('renders spinner with accessible loading text', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
});

// Check that the spinner has a status role for screen readers
test('spinner has status role for screen readers', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
});
