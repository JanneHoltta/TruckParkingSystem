// eslint-disable-next-line no-shadow
export enum Precision {
  Hours,
  Minutes,
  Seconds
}

export const secondsToPrettyString = (
  seconds: number,
  precision: Precision = Precision.Minutes,
): string => {
  const secondsInMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(secondsInMinutes / 60);
  const minutes = secondsInMinutes % 60;
  const hoursString = hours === 0 ? '' : `${hours} h `;
  const minutesString = (hoursString === '' && minutes === 0) ? '' : `${minutes} min `;

  switch (precision) {
    case Precision.Hours:
      return `${hours} h`;

    case Precision.Minutes:
      return `${hoursString}${minutes} min`;

    case Precision.Seconds:
      return `${hoursString}${minutesString}${seconds % 60} s`;

    default:
      throw new Error('Invalid precision');
  }
};
