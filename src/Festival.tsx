import style from "./Festival.module.css";
import festivalData from "./db/cp2026.json";
import { useEffect, useState } from "react";
import Button from "./widgets/Button";
import { useAppContext } from "./context/AppContext";
import FestivalEvent from "./FestivalEvent";

let fakeKey = 0;
function ListEvents(props: { events: any[] }) {
  const { votes } = useAppContext();
  const events = props.events.map((event) => {
    const scoreRecord = votes.find((v) => {
      return v.band === event.name.toLocaleLowerCase().trim();
    });
    return (
      <FestivalEvent
        key={fakeKey++}
        name={event.name}
        score={scoreRecord ? scoreRecord.score : 2}
        time={event.time}
        urls={event.urls}
      />
    );
  });
  return <>{events}</>;
}

function ListStages(props: { stages: any[] }) {
  const stages = props.stages.map((stage) => (
    <div key={fakeKey++} className={style.stages}>
      <h3>{stage.name}</h3>
      <ListEvents events={stage.events} />
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
    return <DateView key={day.date} day={day} />;
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

const findNow = () => {
  const day = festivalData.days.find((day) => isToday(day.date));
  if (!day) return [];

  return day.stages
    .map((stage) => {
      const event = stage.events.find((event: any) => isTimeNow(event.time));
      return { ...event, stage: stage.name };
    })
    .filter((e) => e.name);
};

function ShowNow() {
  const events = findNow();
  if (events.length === 0) return <></>;

  return <ShowNowNext events={events} />;
}

function isTimeNext(datetimeStr: string) {
  const now = new Date();
  const next = new Date(datetimeStr);
  return now < next;
}

function ShowNowNext(props: { events: any }) {
  const { votes } = useAppContext();
  const getScore = (name: string) => {
    const s = votes.find((v) => v.band === name.toLocaleLowerCase().trim());
    return s;
  };

  const result = props.events.map((event: any) => {
    return (
      <div key={fakeKey++}>
        <h4>{event.stage}</h4>
        <FestivalEvent
          key={fakeKey++}
          name={event.name}
          score={getScore(event.name) ? getScore(event.name).score : 2}
          time={event.time}
          urls={[]}
        />
      </div>
    );
  });
  return result;
}

const findNext = () => {
  const day = festivalData.days.find((day) => isToday(day.date));
  if (!day) return [];

  return day.stages.map((stage) => {
    const event = stage.events.find((event: any) => isTimeNext(event.time));
    return { ...event, stage: stage.name };
  });
};

function ShowNext() {
  const events = findNext();
  if (events.length === 0) return <></>;

  return <ShowNowNext events={events} />;
}

function Festival() {
  const { logout, shareVotes } = useAppContext();

  const onLogOut = () => {
    logout();
  };

  const onShare = async () => {
    const result = await shareVotes();
    window.open(`/?share=${result.token}`);
  };

  return (
    <div className={style.root}>
      <div className={style.festival}>{festivalData.festival}</div>
      <div className={style.now}>Now:</div>
      <div className={style.shownow}>
        <ShowNow />
      </div>
      <div className={style.next}>Next:</div>
      <div className={style.shownow}>
        <ShowNext />
      </div>
      <ListDates />
      <div className={style.buttons}>
        <Button label="Share" onClick={onShare} />
        <Button label="Log out" onClick={onLogOut} />
      </div>
    </div>
  );
}

export default Festival;
