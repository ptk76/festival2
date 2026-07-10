import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import style from "./Login.module.css";
import TextInput from "../widgets/TextInput";
import Button from "../widgets/Button";
import { OnNavigate } from "../App";

function Login(props: { onNavigate: OnNavigate }): React.JSX.Element {
  const { create, login } = useAppContext();
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
    create(nick, loginStr, password);
  };

  const handleLoginButton = async () => {
    const result = await login(loginStr, password);
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
      <div className={style.buttons}>
        <Button label="Create" onClick={handleCreateButton} />
        <div className={style.rightButton}>
          <Button label="Log in" onClick={handleLoginButton} />
        </div>
      </div>
    </div>
  );
}

export default Login;
