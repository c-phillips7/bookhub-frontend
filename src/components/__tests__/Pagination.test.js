import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '../Pagination';

// Check that the Pagination component renders nothing when there is only one page
test('renders nothing when there is only one page', () => {
    const { container } = render(
        <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
    );
    expect(container.firstChild).toBeNull();
});

// Check that the correct number of page buttons are rendered based on the totalPages prop
test('renders a button for each page', () => {
    render(<Pagination currentPage={1} totalPages={3} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
});

// Check that the Previous button is disabled on the first page
test('Previous button is disabled on the first page', () => {
    render(<Pagination currentPage={1} totalPages={3} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
});

// Check that the "Next" button is disabled when on the last page
test('Next button is disabled on the last page', () => {
    render(<Pagination currentPage={3} totalPages={3} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
});

// Check that clicking a page button calls the onPageChange callback with the correct page number
test('calls onPageChange with the correct page number when a page button is clicked', () => {
    const handlePageChange = jest.fn();
    render(<Pagination currentPage={1} totalPages={3} onPageChange={handlePageChange} />);
    fireEvent.click(screen.getByRole('button', { name: '2' }));
    expect(handlePageChange).toHaveBeenCalledWith(2);
});
