export function secToTime(seconds: any) {
  const date = new Date(seconds * 1000);
  const year = date.getFullYear();
  let month: string | number = date.getMonth() + 1;
  let day: string | number = date.getDate();
  const hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
  const minute =
    date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
  // const second =
  //   date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
  if (month < 10) month = "0" + month;
  if (day < 10) day = "0" + day;
  const currentTime =
    year + "/" + month + "/" + day + "  " + hour + ":" + minute;
  // ':' +
  // second;
  return currentTime;
}
