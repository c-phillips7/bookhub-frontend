import { Link } from "react-router-dom";

const sections = [
    { to: "/update/books",   label: "Books",   description: "Create, edit, and delete books." },
    { to: "/update/authors", label: "Authors", description: "Create, edit, and delete authors." },
    { to: "/update/genres",  label: "Genres",  description: "Create, edit, and delete genres." },
    { to: "/update/users",   label: "Users",   description: "View and delete user accounts." },
];

function Update() {
    return (
        <div>
            <h2 className="mb-4">Admin Panel</h2>
            <div className="row row-cols-1 row-cols-md-2 g-4">
                {sections.map((s) => (
                    <div className="col" key={s.to}>
                        <div className="card h-100">
                            <div className="card-body">
                                <h5 className="card-title">{s.label}</h5>
                                <p className="card-text text-muted">{s.description}</p>
                                <Link to={s.to} className="btn btn-primary">Manage {s.label}</Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Update;
