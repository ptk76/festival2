import React, { createContext, useState, useContext, ReactNode } from "react";

interface AppContextType {
  login: (login: string, password: string) => void;
  isAuthenticated: () => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const queryDatabase = async (api: string): Promise<unknown[]> => {
  try {
    const result = await fetch(api);
    return await result.json();
  } catch (_) {
    return [];
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [userId, setUserId] = useState<number>(-1);

  const login = async (login: string, password: string) => {
    const result = await queryDatabase(
      `/login?login=${login}&password=${password}`,
    );
    if (result.length > 0) {
      const id = Number(result[0].id);
      setUserId(id);
    }
  };

  const isAuthenticated = () => {
    return userId !== -1;
  };

  return (
    <AppContext.Provider
      value={{
        login,
        isAuthenticated,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
