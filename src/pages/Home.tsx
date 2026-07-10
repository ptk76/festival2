import React from "react";
import { useAppContext } from "../context/AppContext";
import style from "./Home.module.css";
import { OnNavigate } from "../App";
import Button from "../widgets/Button";

function Home(props: { onNavigate: OnNavigate }): React.JSX.Element {
  const { logout, votes } = useAppContext();

  const onLogOut = () => {
    logout();
  };

  return (
    <div className={style.container}>
      HOME
      <Button label="Log out" onClick={onLogOut} />
    </div>
  );
}

export default Home;
