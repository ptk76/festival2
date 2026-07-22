import style from "./FestivalEvent.module.css";
import { stringTimeToClockTime } from "./pages/utils";

let fakeKey = 0;

import { useEffect, useRef, useState } from "react";
import { useAppContext } from "./context/AppContext";

export function ScoreIcon(props: { score: number }) {
  const OFFEST = 1;
  const localScore = String(
    isNaN(props.score) ? 2 + OFFEST : props.score + OFFEST,
  );
  let cStyle = style.scoreicon;

  switch (props.score) {
    case 0:
      cStyle += " " + style.bad;
      break;
    case 1:
      cStyle += " " + style.medicore;
      break;
    case 3:
      cStyle += " " + style.good;
      break;
    case 4:
      cStyle += " " + style.excelent;
      break;
  }
  return <div className={cStyle}>{localScore}</div>;
}

function ListUrls(props: { urls: string[] }) {
  const urls = props.urls.map((url) => (
    <a key={fakeKey++} className={style.url} href={url} target="_blank">
      {url.includes("youtube") ? "Listen" : "Visit"}
    </a>
  ));
  return <>{urls}</>;
}

function Score(props: { name: string; score: number; static?: boolean }) {
  const [score, setScore] = useState(props.score);
  const { setVote, updateLocalVote } = useAppContext();
  let timeout = useRef(0);

  const debounce = (band: string, score: number) => {
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      setVote(band, score);
    }, 5000);
  };

  return (
    <div
      className={style.score}
      onClick={async () => {
        if (props.static === true) return;
        const newScore = (score + 1) % 5;
        setScore(newScore);
        updateLocalVote(props.name, newScore);
        debounce(props.name, newScore);
      }}
    >
      <ScoreIcon score={score} />
    </div>
  );
}

function FestivalEvent(props: {
  time: string;
  name: string;
  urls: string[];
  score: number;
  static?: boolean;
}) {
  return (
    <div className={style.container}>
      <div className={style.time}>{stringTimeToClockTime(props.time)}</div>
      <div className={style.eventname}>{props.name}</div>
      <Score name={props.name} score={props.score} static={props.static} />
      <ListUrls urls={props.urls} />
    </div>
  );
}

export default FestivalEvent;
