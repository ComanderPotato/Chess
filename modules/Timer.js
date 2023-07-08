export default class Timer {
    constructor(initialTime, isWhitesTimer) {
        // this.totalMinutes = time * 60;
        this.isWhite;
        this.initialTime = initialTime;
        this.minutes = Math.floor(this.initialTime);
        this.seconds = (this.initialTime * 60) % 60;
        this.initializeTimerElement(isWhitesTimer);
    }
    initializeTimerElement(isWhitesTimer) {
        const playerColor = isWhitesTimer ? "white" : "black";
        this.secondsEl = document.getElementById(`timer--seconds-${playerColor}`);
        this.minutesEl = document.getElementById(`timer--minutes-${playerColor}`);
        this.minutesEl.textContent = String(this.minutes);
        this.secondsEl.textContent = String(this.seconds < 10 ? `0${this.seconds}` : this.seconds);
    }
    startTimer() {
        this.timerInterval = setInterval(() => {
            if (this.seconds <= 0 && this.minutes <= 0) {
                this.timerFinish();
            }
            else if (this.seconds <= 0) {
                this.seconds = 59;
                --this.minutes;
            }
            else {
                --this.seconds;
            }
            this.minutesEl.textContent = String(this.minutes);
            this.secondsEl.textContent = String(this.seconds < 10 ? `0${this.seconds}` : this.seconds);
        }, 1000);
    }
    stopTimer() {
        clearInterval(this.timerInterval);
    }
    resetTimer() {
        clearInterval(this.timerInterval);
        this.minutes = Math.floor(this.initialTime);
        this.seconds = (this.initialTime * 60) % 60;
        this.initializeTimerElement(this.isWhite);
    }
    timerFinish() {
        this.stopTimer();
    }
}
// const timer = new Timer(60);
