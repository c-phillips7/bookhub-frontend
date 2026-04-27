function SearchBar({ value, onChange, placeholder }) {
    return (
        <div className="mb-3">
            <input
                type = "text"
                className="form-control"
                placeholder={placeholder || "Search..."}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

export default SearchBar;