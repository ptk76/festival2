import React from "react";
import style from "./Button.module.css";

function Button(props: {
  label: string;
  disable?: boolean;
  onClick: () => void;
}): React.JSX.Element {
  return (
    <div className={style.container}>
      <button
        className={style.button}
        disabled={props.disable ? props.disable : false}
        onClick={props.onClick}
      >
        {props.label}
      </button>
    </div>
  );
}

export default Button;
