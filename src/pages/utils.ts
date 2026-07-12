export function stringTimeToClockTime(strTime: string) {
  const time = new Date(strTime);
  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}
