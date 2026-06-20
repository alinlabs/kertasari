import React, { createContext, useContext, useState, useEffect } from "react";
import { Keanggotaan } from "../types";

interface AuthContextType {
  user: Keanggotaan | null;
  login: (user: Keanggotaan) => void;
  logout: () => void;
  updateUser: (user: Keanggotaan) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<Keanggotaan | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
  }, []);

  const login = (newUser: Keanggotaan) => {
    setUser(newUser);
    localStorage.setItem("currentUser", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
  };

  const updateUser = (updatedUser: Keanggotaan) => {
    setUser(updatedUser);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
