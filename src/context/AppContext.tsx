import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import {
  isResponseMessage,
  MESSAGE_TYPE,
  ResponseMessage,
} from "../../worker/errors";
import { LogInType } from "../../worker/db-types";

import fest0 from "../db/poland_rock.json";
import fest1 from "../db/brutal2026.json";

type FestivalType = {
  festival: string;
  days: {
    date: string;
    stages: {
      name: string;
      events: { time: string; name: string; urls: string[] }[];
    }[];
  }[];
};

interface AppContextType {
  create: (
    nick: string,
    login: string,
    password: string,
  ) => Promise<ResponseMessage>;
  login: (login: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  nick: string;
  votes: any[];
  setVote: (band: string, score: number) => void;
  updateLocalVote: (band: string, score: number) => void;
  shareVotes: () => Promise<{ token: string }>;
  getSharedVotes: (id: string) => Promise<{ band: string; score: number }[]>;
  getSharedNick: (id: string) => Promise<string | null>;
  festivalData: FestivalType;
  switchFestivalData: (id: number) => void;
  getFestivals: () => { name: string; id: number }[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [nick, setNick] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [votes, setVotes] = useState<{ band: string; score: number }[]>([]);

  const [festivalData, setFestivalData] = useState<FestivalType>(fest0);

  const switchFestivalData = (id: number) => {
    if (id === 0) setFestivalData(fest0);
    if (id === 1) setFestivalData(fest1);
    localStorage.setItem("festival", String(id));
  };
  const getFestivals = () => {
    return [
      { name: fest0.festival, id: 0 },
      { name: fest1.festival, id: 1 },
    ];
  };
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
    const f = localStorage.getItem("festival");
    if (f) {
      switchFestivalData(Number(f));
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
    )) as unknown as { token: string; nick: string };
    setNick(result.nick ?? "");
    setToken(result.token ?? null);
    if (!!result.token) localStorage.setItem("token", result.token);
    setIsAuthenticated(!!result.token);
    if (!!result.token) await getVotes(result.token);

    return !!result.token;
  };

  const create = async (nick: string, login: string, password: string) => {
    const result = await queryDatabase(
      `/create?nick=${nick}&login=${login}&password=${password}`,
    );
    if (isResponseMessage(result)) return result as unknown as ResponseMessage;
    else return { msg: "", type: MESSAGE_TYPE.SUCCESS } as ResponseMessage;
  };

  const getVotes = async (token: string) => {
    const result = (await queryDatabase(`/votes?token=${token}`)) as {
      band: string;
      score: number;
    }[];
    setVotes(result);
    return true;
  };

  const shareVotes = async () => {
    const result = await queryDatabase(`/newshare?token=${token}`);
    return result as unknown as { token: string };
  };

  const getSharedVotes = async (token: string) => {
    const result = (await queryDatabase(`/share?token=${token}`)) as {
      band: string;
      score: number;
    }[];
    return result;
  };
  const getSharedNick = async (token: string) => {
    const result = (await queryDatabase(`/nick?token=${token}`)) as {
      nick: string;
    }[];
    if (result.length === 0) return null;
    return result[0].nick;
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
        `/setvote?token=${token}&band=${band.toLocaleLowerCase().trim()}&score=${score}`,
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
        shareVotes,
        getSharedVotes,
        getSharedNick,
        festivalData,
        switchFestivalData,
        getFestivals,
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
