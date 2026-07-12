import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import style from "./Login.module.css";
import TextInput from "../widgets/TextInput";
import Button from "../widgets/Button";
import { OnNavigate } from "../App";
import { MESSAGE_TYPE } from "../../worker/errors";

function SignIn(props: { onNavigate: OnNavigate }): React.JSX.Element {
  const { create } = useAppContext();
  const [nick, setNick] = useState("");
  const [loginStr, setLoginStr] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [disableSigIn, setDisableSignIn] = useState(false);

  const handleNickChange = (text: string) => {
    setNick(text);
    setErrorMsg("");
  };

  const handleLoginChange = (text: string) => {
    setLoginStr(text);
    setErrorMsg("");
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setErrorMsg("");
  };

  const handleSignInButton = async () => {
    const result = await create(nick, loginStr, password);
    if (result.type === MESSAGE_TYPE.SUCCESS)
      props.onNavigate("login", { login: { user: loginStr } });
    else setErrorMsg(result.msg);
  };

  const handleCancelButton = async () => {
    props.onNavigate("login");
  };

  useEffect(() => {
    if (nick === "" || loginStr === "" || password === "")
      setDisableSignIn(true);
    else setDisableSignIn(false);
    return () => {};
  }, [loginStr, password]);

  return (
    <div className={style.container}>
      <div className={style.error}>{errorMsg}</div>
      <TextInput label="Nick" onChange={handleNickChange} />
      <TextInput label="Login" onChange={handleLoginChange} />
      <TextInput
        label="Password"
        onChange={handlePasswordChange}
        isPassword={true}
      />
      <div className={style.buttons}>
        <div className={style.leftButton} onClick={handleCancelButton}>
          Back
        </div>
        <div className={style.rightButton}>
          <Button
            label="Create"
            disable={disableSigIn}
            onClick={handleSignInButton}
          />
        </div>
      </div>
    </div>
  );
}

export default SignIn;
