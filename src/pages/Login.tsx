import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import style from "./Login.module.css";
import TextInput from "../widgets/TextInput";
import Button from "../widgets/Button";
import { OnNavigate } from "../App";

function Login(props: { onNavigate: OnNavigate }): React.JSX.Element {
  const { login } = useAppContext();
  const [nick, setNick] = useState("");
  const [loginStr, setLoginStr] = useState("");
  const [password, setPassword] = useState("");

  const handleNickChange = (text: string) => {
    setNick(text);
  };

  const handleLoginChange = (text: string) => {
    setLoginStr(text);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
  };

  const handleCreateButton = () => {
    console.log("LOG IN");
  };
  return (
    <div className={style.container}>
      <TextInput label="Nick" onChange={handleNickChange} />
      <TextInput label="Login" onChange={handleLoginChange} />
      <TextInput
        label="Password"
        onChange={handlePasswordChange}
        isPassword={true}
      />
      <Button label="Create" onClock={handleCreateButton} />
    </div>
  );
}

export default Login;
