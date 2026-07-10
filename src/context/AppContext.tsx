import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

interface AppContextType {
  create: (nick: string, login: string, password: string) => Promise<boolean>;
  login: (login: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  nick: string;
  votes: () => Promise<Map<string, number>>;
  setVote: (band: string, score: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const queryDatabase = async (api: string): Promise<unknown[]> => {
  try {
    const result = await fetch(api);
    console.log("CONTEXT", await result);
    if (result.status != 200) return [];
    return await result.json();
  } catch (error) {
    console.log("Error", error);
    return [];
  }
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [nick, setNick] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) {
      setToken(t);
      setIsAuthenticated(true);
    }
    return () => {};
  }, []);

  const logout = async () => {
    setNick("");
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token");
  };

  const login = async (login: string, password: string) => {
    const result = (await queryDatabase(
      `/login?login=${login}&password=${password}`,
    )) as unknown as { nick: string; token: string };
    setNick(result.nick ?? "");
    setToken(result.token);
    localStorage.setItem("token", result.token);
    setIsAuthenticated(result.token !== null);
    return result.token !== null;
  };

  const create = async (nick: string, login: string, password: string) => {
    const result = await queryDatabase(
      `/create?nick=${nick}&login=${login}&password=${password}`,
    );
    console.log("RESULT", result);
    return true;
  };

  // const isAuthenticated = () => {
  //   return token !== null;
  // };

  const votes = async () => {
    const result = (await queryDatabase(`/votes?token=${token}`)) as {
      band: string;
      score: number;
    }[];
    const ret = new Map<string, number>();
    result.forEach((vote) => ret.set(vote.band, vote.score));
    return ret;
  };

  const setVote = async (band: string, score: number) => {
    const result = await queryDatabase(
      `/votes?token=${token}&cmd=add&band=${band}&score=${score}`,
    );
    console.log("RESULT", result);
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        create,
        login,
        logout,
        nick,
        isAuthenticated,
        votes,
        setVote,
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
