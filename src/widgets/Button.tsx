import React from "react";
import style from "./Button.module.css";

function Button(props: {
  label: string;
  onClock: () => void;
}): React.JSX.Element {
  return (
    <div className={style.container}>
      <div className={style.label} onClick={props.onClock}>
        {props.label}
      </div>
    </div>
  );
}

export default Button;
