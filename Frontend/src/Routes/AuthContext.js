// src/AuthContext.js
import { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("admin")) || null);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("admin", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("admin");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);