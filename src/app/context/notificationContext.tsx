"use client";
import React, { createContext, useState, ReactNode } from "react";

type NotifierContextType = {
  message: string;
  setMessage: (msg: string) => void;
};

export const NotifierContext = createContext<NotifierContextType>({
  message: "",
  setMessage: () => {},
});

type NotifierProviderProps = {
  children: ReactNode;
};

export function NotifierProvider({ children }: NotifierProviderProps) {
  const [message, setMessage] = useState<string>("");

  return (
    <NotifierContext.Provider value={{ message, setMessage }}>
      {children}
    </NotifierContext.Provider>
  );
}
