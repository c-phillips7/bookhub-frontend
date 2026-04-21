import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

// Decode the JWT payload and return roles as an array.
function getRolesFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const role =
      payload["role"] ||
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    if (!role) return [];
    return Array.isArray(role) ? role : [role];
  } catch {
    return [];
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // If a token exists on mount but user is missing (e.g. existing session before user
  // persistence was added), re-fetch the user profile to populate the context.
  useEffect(() => {
    if (token && !user) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/api/account/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUser(res.data);
          localStorage.setItem("user", JSON.stringify(res.data));
        })
        .catch(() => {
          // Token is invalid or expired — clear the stale session
          setToken(null);
          localStorage.removeItem("token");
        });
    }
  }, []);

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem("token", jwtToken);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const isAdmin = token ? getRolesFromToken(token).includes("Admin") : false;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};


// Hook to be called in components to access auth state and functions
export function useAuth() {
  return useContext(AuthContext);
}
