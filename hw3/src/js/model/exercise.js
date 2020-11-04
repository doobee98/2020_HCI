
URL = "./rsc/exercise"

class Exercise {
    constructor(name) {
        this.name = name;
        this.on = false;
        this.interval = 5;
        this.count = 3;
    }

    get movieURL() { return URL + `/${this.name}.mp4`; }
    get iconURL() { return URL + `/${this.name}.png`; }
}

export default Exercise;
