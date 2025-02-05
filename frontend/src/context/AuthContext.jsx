import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [userType, setUserType] = useState(localStorage.getItem("userType") || null);

  useEffect(() => {
    localStorage.setItem("token", token);
    localStorage.setItem("userType", userType);
  }, [token, userType]);

  const login = (newToken, type) => {
    setToken(newToken);
    setUserType(type);
  };

  const logout = () => {
    setToken(null);
    setUserType(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
  };

  return (
    <AuthContext.Provider value={{ token, userType, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
