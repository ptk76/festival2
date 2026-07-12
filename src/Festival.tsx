import style from "./Festival.module.css";
import festivalData from "./db/cp2026.json";
import { useContext, useEffect, useRef, useState } from "react";
import Button from "./widgets/Button";
import { useAppContext } from "./context/AppContext";

let fakeKey = 0;

import imgWiki from "./assets/wikipedia.webp";
import imgSpotify from "./assets/spotify.webp";
import imgYoutube from "./assets/youtube.webp";
import imgFacebook from "./assets/facebook.webp";
import imgEarth from "./assets/earth.webp";

function getIconPath(url: string) {
  if (url.includes("wikipedia")) return imgWiki;
  if (url.includes("youtube")) return imgYoutube;
  if (url.includes("spotify")) return imgSpotify;
  if (url.includes("facebook")) return imgFacebook;
  return imgEarth;
}

function GetIconForUrl(props: { url: string }) {
  return (
    <div>
      <img src={getIconPath(props.url)} height="24px" />
    </div>
  );
}

function ListUrls(props: { urls: string[] }) {
  const urls = props.urls.map((url) => (
    <div key={fakeKey++} className={style.url}>
      <a href={url} target="_blank">
        <GetIconForUrl url={url} />
      </a>
    </div>
  ));
  return <>{urls}</>;
}

import imgScore0 from "./assets/score_0.png";
import imgScore1 from "./assets/score_1.png";
import imgScore2 from "./assets/score_2.png";
import imgScore3 from "./assets/score_3.png";
import imgScore4 from "./assets/score_4.png";
import { stringTimeToClockTime } from "./pages/utils";

function ScoreIcon(props: { score: number }) {
  switch (props.score) {
    case 0:
      return <img className={style.scoreicon} src={imgScore0} />;
    case 1:
      return <img className={style.scoreicon} src={imgScore1} />;
    case 3:
      return <img className={style.scoreicon} src={imgScore3} />;
    case 4:
      return <img className={style.scoreicon} src={imgScore4} />;
  }
  return <img className={style.scoreicon} src={imgScore2} />;
}

function debounce(func: any, delay: number) {
  let timeout = useRef(0);
  return function (...args: any) {
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

function Score(props: { name: string; score: number }) {
  const [score, setScore] = useState(props.score);
  const { setVote, updateLocalVote } = useAppContext();

  const dSetVote = debounce(setVote, 5000);
  return (
    <div
      className={style.score}
      onClick={async () => {
        const newScore = (score + 1) % 5;
        setScore(newScore);
        updateLocalVote(props.name, newScore);
        dSetVote(props.name, newScore);
      }}
    >
      <ScoreIcon score={score} />
    </div>
  );
}

function FixedScore(props: { name: string }) {
  const { votes } = useAppContext();

  const scoreRecord = votes.find(
    (v) => v.band === props.name.toLocaleLowerCase().trim(),
  );
  return (
    <div className={style.score}>
      <ScoreIcon score={scoreRecord ? scoreRecord.score : 2} />
    </div>
  );
}

function ListEvents(props: { events: any[] }) {
  const { votes } = useAppContext();
  const events = props.events.map((event) => {
    const scoreRecord = votes.find(
      (v) => v.band === event.name.toLocaleLowerCase().trim(),
    );
    return (
      <div key={fakeKey++} className={style.events}>
        <Score name={event.name} score={scoreRecord ? scoreRecord.score : 2} />
        {stringTimeToClockTime(event.time)}{" "}
        <div className={style.eventname}>{event.name}</div>{" "}
        <ListUrls urls={event.urls} />
      </div>
    );
  });
  return <>{events}</>;
}

function ListStages(props: { stages: any[] }) {
  const stages = props.stages.map((stage) => (
    <div key={fakeKey++} className={style.stages}>
      {stage.name} <ListEvents events={stage.events} />
    </div>
  ));
  return <>{stages}</>;
}

function isToday(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  return (
    date.getFullYear === now.getFullYear &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function DateView(props: { day: any }) {
  const [show, setShow] = useState(true);

  const getDay = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return dayNames[day];
  };

  useEffect(() => {
    setShow(isToday(props.day.date));
    return () => {};
  }, []);

  return (
    <div key={fakeKey++} className={style.dates}>
      <div
        className={style.daytitle}
        onClick={() => {
          setShow(!show);
        }}
      >
        {getDay(props.day.date)}
      </div>

      {show && <ListStages stages={props.day.stages} />}
    </div>
  );
}

function ListDates() {
  const dates = festivalData.days.map((day) => {
    return <DateView day={day} />;
  });
  return <>{dates}</>;
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function isTimeNow(datetimeStr: string) {
  const now = new Date();
  const nowStart = new Date(datetimeStr);
  const nowEnd = addMinutes(nowStart, 60);

  return now >= nowStart && now < nowEnd;
}

function FindNow(props: { stage: any }) {
  const [div, setDiv] = useState(<></>);

  useEffect(() => {
    const day = festivalData.days.find((day) => isToday(day.date));
    if (day) {
      const event = props.stage.events.find((event: any) =>
        isTimeNow(event.time),
      );
      if (event)
        setDiv(
          <>
            <div className={style.stagesnow}>
              {props.stage.name}
              <div className={style.events}>
                <FixedScore name={event.name} />
                {stringTimeToClockTime(event.time)}{" "}
                <div className={style.eventname}>{event.name}</div>{" "}
              </div>
            </div>
          </>,
        );
    }

    return () => {};
  }, []);

  return div;
}

function ShowNow() {
  const day = festivalData.days.find((day) => isToday(day.date));
  if (!day) return <></>;

  return day.stages.map((stage) => <FindNow stage={stage} />);
}

function isTimeNext(datetimeStr: string) {
  const now = new Date();
  const next = new Date(datetimeStr);
  return now < next;
}

function FindNext(props: { stage: any }) {
  const [div, setDiv] = useState(<>-</>);

  useEffect(() => {
    const day = festivalData.days.find((day) => isToday(day.date));
    if (day) {
      const event = props.stage.events.find((event: any) =>
        isTimeNext(event.time),
      );
      if (event) {
        setDiv(
          <>
            <div className={style.stagesnow}>
              {props.stage.name}
              <div className={style.events}>
                <FixedScore name={event.name} />
                {stringTimeToClockTime(event.time)}{" "}
                <div className={style.eventname}>{event.name}</div>{" "}
              </div>
            </div>
          </>,
        );
      }
    }

    return () => {};
  }, []);

  return div;
}

function ShowNext() {
  const day = festivalData.days.find((day) => isToday(day.date));
  if (!day) return <>---</>;

  return day.stages.map((stage) => <FindNext stage={stage} />);
}

function FestivalEvent() {
  const { logout } = useAppContext();

  const onLogOut = () => {
    logout();
  };

  return (
    <div className={style.root}>
      <div className={style.festival}>{festivalData.festival}</div>
      <div className={style.rightButton}>
        <Button label="Log out" onClick={onLogOut} />
      </div>
      <div>Now:</div>
      <div className={style.shownow}>
        <ShowNow />
      </div>
      <div>Next:</div>
      <div className={style.shownow}>
        <ShowNext />
      </div>
      <ListDates />
    </div>
  );
}

export default FestivalEvent;
