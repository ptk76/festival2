import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import style from "./Login.module.css";
import TextInput from "../widgets/TextInput";
import Button from "../widgets/Button";
import { OnNavigate, PageData } from "../App";

function Login(props: {
  data?: PageData;
  onNavigate: OnNavigate;
}): React.JSX.Element {
  const { login } = useAppContext();
  const [errorMsg, setErrorMsg] = useState("");
  const [loginStr, setLoginStr] = useState(props.data?.login?.user ?? "");
  const [password, setPassword] = useState("");
  const [disableLogin, setDisableLogin] = useState(false);

  const handleLoginChange = (text: string) => {
    setLoginStr(text);
    setErrorMsg("");
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setErrorMsg("");
  };

  const handleSigInButton = () => {
    props.onNavigate("sign");
  };

  const handleLoginButton = async () => {
    const result = await login(loginStr, password);
    if (!result) setErrorMsg("Incorrect credentials");
    else setErrorMsg("");
  };

  useEffect(() => {
    if (loginStr === "" || password === "") setDisableLogin(true);
    else setDisableLogin(false);
    return () => {};
  }, [loginStr, password]);

  return (
    <div className={style.container}>
      <div className={style.error}>{errorMsg}</div>
      <TextInput
        label="Login"
        onChange={handleLoginChange}
        initialValue={props.data?.login?.user}
      />
      <TextInput
        label="Password"
        onChange={handlePasswordChange}
        isPassword={true}
      />
      <div className={style.buttons}>
        <div className={style.leftButton} onClick={handleSigInButton}>
          Sign In
        </div>
        <div className={style.rightButton}>
          <Button
            label="Log in"
            disable={disableLogin}
            onClick={handleLoginButton}
          />
        </div>
      </div>
    </div>
  );
}

export default Login;
