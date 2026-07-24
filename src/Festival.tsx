import style from "./Festival.module.css";
import { useEffect, useState } from "react";
import Button from "./widgets/Button";
import { useAppContext } from "./context/AppContext";
import FestivalEvent from "./FestivalEvent";
import Menu from "./Menu";

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

function isToday(timeNow: number, dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date(timeNow);
  return (
    date.getFullYear === now.getFullYear &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function DateView(props: { timeNow: number; day: any }) {
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
    setShow(isToday(props.timeNow, props.day.date));
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

function ListDates(props: { timeNow: number }) {
  const { festivalData } = useAppContext();
  const dates = festivalData.days.map((day) => {
    return <DateView key={day.date} timeNow={props.timeNow} day={day} />;
  });
  return <>{dates}</>;
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function isTimeNow(timeNow: number, datetimeStr: string) {
  const now = new Date(timeNow);
  const nowStart = new Date(datetimeStr);
  const nowEnd = addMinutes(nowStart, 60);

  return now >= nowStart && now < nowEnd;
}

const findNow = (timeNow: number) => {
  const { festivalData } = useAppContext();
  const day = festivalData.days.find((day) => isToday(timeNow, day.date));
  if (!day) return [];

  return day.stages
    .map((stage) => {
      const event = stage.events.find((event: any) =>
        isTimeNow(timeNow, event.time),
      );
      return { ...event, stage: stage.name };
    })
    .filter((e) => !!e.name);
};

function ShowNow(props: { timeNow: number }) {
  const events = findNow(props.timeNow);
  if (events.length === 0) return <></>;

  return <ShowNowNext events={events} />;
}

function isTimeNext(timeNow: number, datetimeStr: string) {
  const now = new Date(timeNow);
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

const findNext = (timeNow: number) => {
  const { festivalData } = useAppContext();
  const day = festivalData.days.find((day) => isToday(timeNow, day.date));
  if (!day) return [];

  return day.stages
    .map((stage) => {
      const event = stage.events.find((event: any) =>
        isTimeNext(timeNow, event.time),
      );
      return { ...event, stage: stage.name };
    })
    .filter((e) => !!e.name);
};

function ShowNext(props: { timeNow: number }) {
  const events = findNext(props.timeNow);
  if (events.length === 0) return <></>;

  return <ShowNowNext events={events} />;
}

function Festival() {
  const [staticTime, setStaticTime] = useState(Date.now());
  const [showMenu, setShowMenu] = useState(false);
  const { logout, shareVotes, festivalData } = useAppContext();

  const onCloseMenu = () => {
    setShowMenu(false);
  };

  const onBurger = () => {
    setShowMenu(!showMenu);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setStaticTime(Date.now());
    }, 60 * 1000);
    return () => {
      clearInterval(interval);
    };
  });

  return (
    <div className={style.root} onClick={showMenu ? onCloseMenu : () => {}}>
      <div className={style.header}>
        <div className={style.burger} onClick={onBurger}>
          ☰
        </div>
        {showMenu && <Menu onClose={onCloseMenu} />}
        {!showMenu && (
          <div className={style.festival}>{festivalData.festival}</div>
        )}
      </div>
      {!showMenu && (
        <>
          <div className={style.now}>Now:</div>
          <div className={style.shownow}>
            <ShowNow timeNow={staticTime} />
          </div>
          <div className={style.next}>Next:</div>
          <div className={style.shownext}>
            <ShowNext timeNow={staticTime} />
          </div>
          <ListDates timeNow={staticTime} />
        </>
      )}
    </div>
  );
}

export default Festival;
