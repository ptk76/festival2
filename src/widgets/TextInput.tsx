import React from "react";
import style from "./TextInput.module.css";

function TextInput(props: {
  label: string;
  onChange: (text: string) => void;
  isPassword?: boolean;
}): React.JSX.Element {
  return (
    <div className={style.container}>
      <label className={style.label} htmlFor="description">
        {props.label}
      </label>
      <input
        id="description"
        className={style.input}
        type={props.isPassword ? "password" : "text"}
        onChange={(e) => props.onChange(e.target.value)}
      ></input>
    </div>
  );
}

export default TextInput;
