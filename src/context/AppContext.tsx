"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Lang = "id" | "en";

type AppContextType = {
  lang: Lang;
  setLang: (l: Lang) => void;
  loggedIn: boolean;
  userEmail: string | null;
  login: (email: string) => void;
  logout: () => void;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("id");
  const [loggedIn, setLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const login = (email: string) => {
    setUserEmail(email);
    setLoggedIn(true);
  };

  const logout = () => {
    setUserEmail(null);
    setLoggedIn(false);
  };

  return (
    <AppContext.Provider value={{ lang, setLang, loggedIn, userEmail, login, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
