import React from "react";
import { useAppContext } from "../context/AppContext";
import style from "./Home.module.css";
import { OnNavigate } from "../App";

function Home(props: { onNavigate: OnNavigate }): React.JSX.Element {
  const {} = useAppContext();

  return <div className={style.container}>HOME</div>;
}

export default Home;
