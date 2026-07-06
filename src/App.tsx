import React, { useState } from "react";
import style from "./App.module.css";
import Login from "./pages/Login";
import Home from "./pages/Home";

export type Page = "login" | "home";
export type OnNavigate = (page: Page) => void;

function App(): React.JSX.Element {
  const [page, setPage] = useState<Page>("login");

  const navigateTo: OnNavigate = (page) => {
    setPage(page);
  };

  return (
    <div className={style.container}>
      Festival
      {page === "login" && <Login onNavigate={navigateTo} />}
      {page === "home" && <Home onNavigate={navigateTo} />}
    </div>
  );
}

export default App;
