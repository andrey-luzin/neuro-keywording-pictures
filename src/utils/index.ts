export const getCurrentTime = () => {
  const time = new Date();
  const timeString = `${String(time.getDate()).padStart(2, '0')}-${String(time.getMonth() + 1).padStart(2, '0')}-${time.getFullYear()}_${String(time.getHours()).padStart(2, '0')}-${String(time.getMinutes()).padStart(2, '0')}-${String(time.getSeconds()).padStart(2, '0')}`;

  return timeString;
};

export const getFirstTwoSentences = (text: string) => {
  const match = text.match(/[^.!?]+[.!?]+(\s|$)/g); 
  if (!match) {
    return text; 
  }
  return match.slice(0, 2).join(" ").trim();
}