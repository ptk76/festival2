import React from "react";
import style from "./TextInput.module.css";

function TextInput(props: {
  label: string;
  onChange: (text: string) => void;
  isPassword?: boolean;
}): React.JSX.Element {
  return (
    <div className={style.container}>
      <div className={style.label}>{props.label}</div>
      <input
        className={style.input}
        type={props.isPassword ? "password" : "text"}
        onChange={(e) => props.onChange(e.target.value)}
      ></input>
    </div>
  );
}

export default TextInput;
