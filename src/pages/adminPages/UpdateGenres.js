import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/Api";
import LoadingSpinner from "../../components/LoadingSpinner";

function UpdateGenres() {
    return (
        <div>
            <h2 className="mb-4">Manage Genres</h2>
        </div>
    )

}

export default UpdateGenres;