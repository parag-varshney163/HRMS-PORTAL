import React, { createContext, useState, useEffect } from "react";

// 1. Export the Context so the hook can read it
export const AuthContext = createContext();

// 2. Export the Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (storedUser && token) {
        // Check if user was away longer than 30 min after closing tab
        const tabClosedAt = Number(localStorage.getItem("tabClosedAt"));
        if (tabClosedAt && Date.now() - tabClosedAt > 30 * 60 * 1000) {
          localStorage.clear();
        } else {
          localStorage.removeItem("tabClosedAt");
          setUser(JSON.parse(storedUser));
        }
      }
    } catch (error) {
      console.error("Auth State Error:", error);
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("roleName", userData.role);
    // Seed session activity timestamp on login
    localStorage.setItem("lastActivityTime", String(Date.now()));
    localStorage.removeItem("tabClosedAt");
    setUser(userData);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = "/login";
  };

  const hasRole = (allowedRoles) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    return allowedRoles.includes(user.role.toLowerCase());
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
