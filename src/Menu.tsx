import style from "./Menu.module.css";
import { useAppContext } from "./context/AppContext";

function Menu(props: { onClose: () => void }) {
  const { logout, shareVotes, switchFestivalData, getFestivals } =
    useAppContext();
  const onShwitchFest = (id: number) => {
    switchFestivalData(id);
  };

  const onLogOut = () => {
    logout();
  };

  const onShare = async () => {
    const result = await shareVotes();
    window.open(`/?share=${result.token}`);
  };

  return (
    <div className={style.container}>
      {getFestivals().map((fest) => (
        <div
          className={style.litem}
          onClick={() => {
            onShwitchFest(fest.id);
            props.onClose();
          }}
        >
          {fest.name}
        </div>
      ))}
      <div className={style.separator}></div>
      <div className={style.itemcontainer}>
        <div className={style.ritem} onClick={onShare}>
          Share
        </div>
      </div>
      <div className={style.separator}></div>
      <div className={style.itemcontainer}>
        <div className={style.ritem} onClick={onLogOut}>
          Log out
        </div>
      </div>
    </div>
  );
}

export default Menu;
