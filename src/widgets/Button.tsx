import React from "react";
import style from "./Button.module.css";

function Button(props: {
  label: string;
  onClick: () => void;
}): React.JSX.Element {
  return (
    <div className={style.container}>
      <button className={style.button} onClick={props.onClick}>
        {props.label}
      </button>
    </div>
  );
}

export default Button;
