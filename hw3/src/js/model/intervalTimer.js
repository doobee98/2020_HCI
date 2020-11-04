
/*
    ref: https://stackoverflow.com/a/61174672/14394233
*/

class IntervalTimer {
    constructor(callback, delay) {
        this._callbackStartTime = 0;
        this._remaining = 0;
        this._paused = false;
        this.timerId = null;
        this._callback = callback;
        this._delay = delay;
    }

    pause() {
        if (!this._paused) {
            this.clear();
            this._remaining = new Date().getTime() - this._callbackStartTime;
            this._paused = true;
        }
    }

    resume() {
        if (this._paused) {
            if (this._remaining) {
                setTimeout(() => {
                    this._run();
                    this._paused = false;
                    this.start();
                }, this._remaining);
            } else {
                this._paused = false;
                this.start();
            }
        }
    }

    clear() {
        clearInterval(this.timerId);
    }

    start() {
        this.clear();
        this.timerId = setInterval(() => {
            this._run();
        }, this._delay);
    }

    _run() {
        this._callbackStartTime = new Date().getTime();
        this._callback();
    }
}

export default IntervalTimer;
