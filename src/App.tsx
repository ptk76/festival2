import React, { useEffect, useState } from "react";
import style from "./App.module.css";
import Login from "./pages/Login";
import Festival from "./Festival";
import { useAppContext } from "./context/AppContext";

export type Page = "login" | "home";
export type OnNavigate = (page: Page) => void;

function App(): React.JSX.Element {
  const { isAuthenticated } = useAppContext();
  const [page, setPage] = useState<Page>("login");

  useEffect(() => {
    if (isAuthenticated) setPage("home");
    else setPage("login");
    return;
  }, [isAuthenticated]);

  const navigateTo: OnNavigate = (page) => {
    if (page === "home" && !isAuthenticated) {
      setPage("login");
      return;
    }

    setPage(page);
  };

  return (
    <div className={style.container}>
      {page === "login" && <Login onNavigate={navigateTo} />}
      {page === "home" && <Festival />}
    </div>
  );
}

export default App;
