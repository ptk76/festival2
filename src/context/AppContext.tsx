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
  votes: any[];
  setVote: (band: string, score: number) => void;
  updateLocalVote: (band: string, score: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [nick, setNick] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [votes, setVotes] = useState<{ band: string; score: number }[]>([]);

  const queryDatabase = async (api: string): Promise<unknown[]> => {
    try {
      const result = await fetch(api);
      if (result.status === 401) {
        setIsAuthenticated(false);
        return [];
      }
      return await result.json();
    } catch (error) {
      return [];
    }
  };

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) {
      setToken(t);
      setIsAuthenticated(true);
      getVotes(t);
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
    if (result.token !== null) await getVotes(result.token);

    return result.token !== null;
  };

  const create = async (nick: string, login: string, password: string) => {
    const result = await queryDatabase(
      `/create?nick=${nick}&login=${login}&password=${password}`,
    );
    return true;
  };

  const getVotes = async (token: string) => {
    const result = (await queryDatabase(`/votes?token=${token}`)) as {
      band: string;
      score: number;
    }[];
    setVotes(result);
    return true;
  };

  const updateLocalVote = (band: string, score: number) => {
    const tempVotes = new Array(...votes);
    const voteToUpdate = tempVotes.find(
      (v) => v.band === band.toLocaleLowerCase().trim(),
    );
    if (voteToUpdate) {
      voteToUpdate.score = score;
      setVotes(tempVotes);
    }
  };

  const setVote = async (band: string, score: number) => {
    try {
      const result = await queryDatabase(
        `/votes?token=${token}&cmd=add&band=${band.toLocaleLowerCase().trim()}&score=${score}`,
      );
    } catch (error) {
      console.log("error", error);
    }
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
        updateLocalVote,
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
