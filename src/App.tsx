import React, { useEffect, useState } from "react";
import style from "./App.module.css";
import Login from "./pages/Login";
import Festival from "./Festival";
import { useAppContext } from "./context/AppContext";
import SignIn from "./pages/SignIn";
import ShareFestival from "./ShareFestival";

export type Page = "login" | "home" | "sign";
export type PageData = {
  login?: {
    user: string;
  };
};

export type OnNavigate = (page: Page, data?: PageData) => void;

function App(props: { sharedId?: string }): React.JSX.Element {
  const { isAuthenticated } = useAppContext();
  const [page, setPage] = useState<Page>("login");
  const [pageData, setPageData] = useState<PageData>({});

  useEffect(() => {
    if (isAuthenticated) setPage("home");
    else setPage("login");
    return;
  }, [isAuthenticated]);

  const navigateTo: OnNavigate = (page, data?) => {
    if (page === "home" && !isAuthenticated) {
      setPage("login");
      setPageData(data ?? {});
      return;
    }

    setPage(page);
    setPageData(data ?? {});
  };

  return (
    <>
      {props.sharedId && <ShareFestival shareId={props.sharedId} />}
      {!props.sharedId && (
        <div className={style.container}>
          {page === "login" && (
            <Login data={pageData} onNavigate={navigateTo} />
          )}
          {page === "sign" && <SignIn onNavigate={navigateTo} />}
          {page === "home" && <Festival />}
        </div>
      )}
    </>
  );
}

export default App;
