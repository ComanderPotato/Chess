export default class Timer {
  private seconds: number;
  private minutes: number;
  private initialTime: number;
  private timerInterval: number;
  private secondsEl: HTMLSpanElement | null;
  private minutesEl: HTMLSpanElement | null;
  private isWhite: boolean;
  constructor(initialTime: number, isWhitesTimer: boolean) {
    // this.totalMinutes = time * 60;
    this.isWhite;
    this.initialTime = initialTime;
    this.minutes = Math.floor(this.initialTime);
    this.seconds = (this.initialTime * 60) % 60;
    this.initializeTimerElement(isWhitesTimer);
  }
  private initializeTimerElement(isWhitesTimer: boolean) {
    const playerColor = isWhitesTimer ? "white" : "black";
    this.secondsEl = document.getElementById(
      `timer--seconds-${playerColor}`
    ) as HTMLSpanElement;
    this.minutesEl = document.getElementById(
      `timer--minutes-${playerColor}`
    ) as HTMLSpanElement;

    this.minutesEl.textContent = String(this.minutes);
    this.secondsEl.textContent = String(
      this.seconds < 10 ? `0${this.seconds}` : this.seconds
    );
  }
  public startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.seconds <= 0 && this.minutes <= 0) {
        this.timerFinish();
      } else if (this.seconds <= 0) {
        this.seconds = 59;
        --this.minutes;
      } else {
        --this.seconds;
      }
      this.minutesEl!.textContent = String(this.minutes);
      this.secondsEl!.textContent = String(
        this.seconds < 10 ? `0${this.seconds}` : this.seconds
      );
    }, 1000);
  }
  public stopTimer() {
    clearInterval(this.timerInterval);
  }
  public resetTimer() {
    clearInterval(this.timerInterval);
    this.minutes = Math.floor(this.initialTime);
    this.seconds = (this.initialTime * 60) % 60;
    this.initializeTimerElement(this.isWhite);
  }
  private timerFinish() {
    this.stopTimer();
  }
}
// const timer = new Timer(60);
