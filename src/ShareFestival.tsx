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

function Score(props: { name: string; score: number }) {
  return (
    <div className={style.score}>
      <ScoreIcon score={props.score} />
    </div>
  );
}

function ListEvents(props: { shareId: string; events: any[] }) {
  const [votes, setVotes] = useState<{ band: string; score: number }[]>([]);
  const { getSharedVotes } = useAppContext();

  const updateVotes = async () => {
    setVotes(await getSharedVotes(props.shareId));
  };

  useEffect(() => {
    updateVotes();
    return () => {};
  }, []);

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

function ListStages(props: { shareId: string; stages: any[] }) {
  const stages = props.stages.map((stage) => (
    <div key={fakeKey++} className={style.stages}>
      {stage.name} <ListEvents shareId={props.shareId} events={stage.events} />
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

function DateView(props: { shareId: string; day: any }) {
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

      {show && <ListStages shareId={props.shareId} stages={props.day.stages} />}
    </div>
  );
}

function ListDates(props: { shareId: string }) {
  const dates = festivalData.days.map((day) => {
    return <DateView shareId={props.shareId} key={day.date} day={day} />;
  });
  return <>{dates}</>;
}

function ShareFestival(props: { shareId: string }) {
  const onOpenFestival = () => {
    window.open(`/`);
  };

  return (
    <div className={style.root}>
      <div className={style.festival}>
        {festivalData.festival} - {"nick"}
      </div>
      <ListDates shareId={props.shareId} />
      <div onClick={onOpenFestival}>Open Your Festival</div>
    </div>
  );
}

export default ShareFestival;
