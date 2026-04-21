import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../SearchBar';


// Check that the SearchBar component renders with the provided placeholder
test('renders with the provided placeholder', () => {
    render(<SearchBar value="" onChange={() => {}} placeholder="Search books..." />);
    expect(screen.getByPlaceholderText('Search books...')).toBeInTheDocument();
});

// Check that the SearchBar component falls back to a default placeholder when none is provided
test('falls back to default placeholder when none is provided', () => {
    render(<SearchBar value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
});

// Check that the SearchBar component calls the onChange callback with the typed value
test('calls onChange with the typed value', () => {
    const handleChange = jest.fn();
    render(<SearchBar value="" onChange={handleChange} placeholder="Search..." />);
    fireEvent.change(screen.getByPlaceholderText('Search...'), {
        target: { value: 'gatsby' },
    });
    expect(handleChange).toHaveBeenCalledWith('gatsby');
});
