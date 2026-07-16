import style from "./Festival.module.css";
import festivalData from "./db/cp2026.json";
import { useEffect, useState } from "react";
import { useAppContext } from "./context/AppContext";

let fakeKey = 0;

type VOTES_TYPE = { band: string; score: number }[];

import FestivalEvent from "./FestivalEvent";

function ListEvents(props: { votes: VOTES_TYPE; events: any[] }) {
  const events = props.events.map((event) => {
    const scoreRecord = props.votes.find(
      (v) => v.band === event.name.toLocaleLowerCase().trim(),
    );
    return (
      <FestivalEvent
        key={fakeKey++}
        name={event.name}
        score={scoreRecord ? scoreRecord.score : 2}
        urls={event.urls}
        time={event.time}
        static={true}
      />
    );
  });
  return <>{events}</>;
}

function ListStages(props: { votes: VOTES_TYPE; stages: any[] }) {
  const stages = props.stages.map((stage) => (
    <div key={fakeKey++} className={style.stages}>
      {stage.name} <ListEvents votes={props.votes} events={stage.events} />
    </div>
  ));
  return <>{stages}</>;
}

function DateView(props: { votes: VOTES_TYPE; day: any }) {
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

  return (
    <div key={fakeKey++} className={style.dates}>
      <div className={style.daytitle}>{getDay(props.day.date)}</div>

      <ListStages votes={props.votes} stages={props.day.stages} />
    </div>
  );
}

function ListDates(props: { votes: VOTES_TYPE }) {
  const dates = festivalData.days.map((day) => {
    return <DateView votes={props.votes} key={day.date} day={day} />;
  });
  return <>{dates}</>;
}

function ShareFestival(props: { shareId: string }) {
  const [nick, setNick] = useState<string | null>(null);
  const [sharedVotes, setSharedVotes] = useState<VOTES_TYPE>([]);
  const { getSharedNick, getSharedVotes } = useAppContext();
  const onOpenFestival = () => {
    window.open(`/`);
  };

  const update = async () => {
    const votes = await getSharedVotes(props.shareId);
    const nick = await getSharedNick(props.shareId);
    setSharedVotes(votes);
    setNick(nick);
  };
  useEffect(() => {
    update();
    return () => {};
  }, []);

  return (
    <>
      {nick && (
        <div className={style.root}>
          <div className={style.festival}>
            {festivalData.festival} - {nick}
          </div>
          <ListDates votes={sharedVotes} />
          <div onClick={onOpenFestival}>Open Your Festival</div>
        </div>
      )}
      {!nick && (
        <div className={style.root}>
          <div className={style.festival}>
            {festivalData.festival} - Unknown
          </div>
          <div className={style.error}>Invalid link</div>
          <div onClick={onOpenFestival}>Open Your Festival</div>
        </div>
      )}
    </>
  );
}

export default ShareFestival;
