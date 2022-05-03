
export const getTwentyFourHourTime = (time) => {
  const hour = time.split(":")[0];
  const minute = time.split(":")[1].toLowerCase().replace("am", "").replace("pm", "");
  if (time.toLowerCase().indexOf("am")) {
    return hour + ":" + minute + ":00";
  } else {
    return (hour + 12) + ":" + minute + ":00";
  }
};
