/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import "../lib/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("demo_user") || "null"));
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      if (token === "frontend-demo-token") {
        setLoading(false);
        return;
      }
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get("/api/auth/me");
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await axios.post("/api/auth/login", {
      email,
      password,
    });
    const { token, user } = response.data;
    localStorage.setItem("token", token);
    setToken(token);
    setUser(user);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    return user;
  };

  const register = async (userData) => {
    const response = await axios.post("/api/auth/register", userData);
    const { token, user } = response.data;
    localStorage.setItem("token", token);
    setToken(token);
    setUser(user);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    return user;
  };

  const demoLogin = (role) => {
    const demoUser = {
      id: `demo-${role}`,
      role,
      firstName: role === "admin" ? "Platform" : role === "provider" ? "UrbanFix" : "Aarav",
      lastName: role === "admin" ? "Admin" : role === "provider" ? "Services" : "Customer",
      email: `${role}@demo.com`,
    };
    localStorage.setItem("token", "frontend-demo-token");
    localStorage.setItem("demo_user", JSON.stringify(demoUser));
    setToken("frontend-demo-token");
    setUser(demoUser);
    setLoading(false);
    return demoUser;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("demo_user");
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, login, register, demoLogin, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
