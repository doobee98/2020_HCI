

class Level {
    constructor() {
        this.width = 2;
    }

    getWidth() { return this.width; }

    set(level) {
        switch (level) {
            case 1: this.width = 1; break;
            case 2: this.width = 2; break;
            case 3: this.width = 3; break;
            case 4: this.width = 4; break;
            default: throw Error("Level Exception");
        }
    }
}


class Color {
    constructor(r, g, b, alpha=0xFF) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.alpha = alpha;
    }

    changeColor(deltaR, deltaG, deltaB, deltaAlpha) {
        return new Color(
            this.r + deltaR,
            this.g + deltaG,
            this.b + deltaB,
            this.alpha + deltaAlpha
        );
    }

    formatString() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.alpha})`;
    }
}
Color.WATER = new Color(255, 255, 255, 0);
Color.BLACK = new Color(0, 0, 0);
Color.WHITE = new Color(255, 255, 255);
Color.RED = new Color(255, 0, 0);
Color.GREEN = new Color(0, 255, 0);
Color.BLUE = new Color(0, 0, 255);
Color.GREY = new Color(128, 128, 128);


class Brush {
    constructor() {
        this.level = new Level();
        this.color = Color.BLACK;
        this.gradientTimer = null;
        this.gradientSize = 6;
        this.intervalInMiliSeconds = 500;
        this.colorCallback = () => {};
    }

    getColor() { return this.color; }
    getLevel() { return this.level.getWidth(); }

    setColorCallback(callback) { this.colorCallback = callback; }

    setLevel(level) { 
        this.level.set(level); 
    }
    mixPaintStart(paint) { 
        if (this.gradientTimer) {
            this.mixPaintFinish();
        }

        let count = this.gradientSize;
        this.gradientTimer = setInterval(() => {
            if (count <= 0) {
                this.mixPaintFinish();
                return;
            }

            let gradient = (from, to) => parseInt((to - from) / count);
            this.color = this.color.changeColor(
                gradient(this.color.r, paint.getColor().r),
                gradient(this.color.g, paint.getColor().g),
                gradient(this.color.b, paint.getColor().b),
                gradient(this.color.alpha, paint.getColor().alpha)
            );
            this.colorCallback();

            count--;
        }, this.intervalInMiliSeconds);
    }
    mixPaintFinish() {
        if (this.gradientTimer) {
            clearInterval(this.gradientTimer);
            this.gradientTimer = null;
        }
    }
}


class Paint {
    constructor(color) {
        this.color = color;
    }

    getColor() { return this.color; }
}


class Palette {
    constructor(colorList) {
        this.paintList = colorList.concat(Color.WATER)
                                  .map((color) => new Paint(color));
        // this.water = new Paint(Color.WATER);
    }

    getPaintList() { return this.paintList.slice(); }
}


class Drawing {
    constructor(img_src) {
        this.img = new Image();
        this.img.src = img_src;
        this.canvas = new Array(this.img.width)
                            .fill(0)
                            .map(() => new Array(this.img.height).fill(Color.WATER));
    }

    getImage() { return this.img; }
    getWidth() { return this.img.width; }
    getHeight() { return this.img.height; }

    getPixel(x, y) { return this.img[x][y]; }
    setPixel(x, y, color) {
        this.canvas[x][y] = color;
    }
}




let image = new Image();
image.src = "./rsc/amongus.jpg";


window.onload = function() {   
    const Mode = Object.freeze({
        HOVER: 0,
        DRAW: 1,
    });

    /* load models */
    let palette = new Palette([
        Color.BLACK,
        Color.WHITE,
        Color.RED,
        Color.BLUE,
        Color.GREEN,
    ]);

    let brush = new Brush();
    let drawing = new Drawing("./rsc/amongus.jpg");
    let img_width = drawing.getWidth();
    let img_height = drawing.getHeight();

    /* load html elements and setting */
    let brushColorView = document.getElementById("brush-color");
    brush.setColorCallback(() => {
        brushColorView.style.backgroundColor = brush.getColor().formatString();
    });
    brushColorView.style.backgroundColor = brush.getColor().formatString();

    let paletteView = document.getElementById("palette");
    for(let paint of palette.getPaintList()) {
        let colorNode = document.createElement("div");
        let paintNode = document.createElement("div");
        colorNode.style.backgroundColor = paint.getColor().formatString();
        colorNode.classList.add("color");
        paintNode.appendChild(colorNode);
        paintNode.classList.add("paint");
        paletteView.appendChild(paintNode);

        colorNode.addEventListener("mousedown", event => {
            brush.mixPaintStart(paint);
        });
        colorNode.addEventListener("mouseup", event => {
            brush.mixPaintFinish();
        });
    }

    
    let level1Wrapper = document.getElementById("level1").parentElement;
    let level2Wrapper = document.getElementById("level2").parentElement;
    let level3Wrapper = document.getElementById("level3").parentElement;
    let level4Wrapper = document.getElementById("level4").parentElement;
    let clearHighlight = () => {
        [level1Wrapper, level2Wrapper, level3Wrapper, level4Wrapper]
            .forEach(elem => elem.classList.remove("highlight"));
    }
    let changeLevel = (wrapper, level) => {
        clearHighlight();
        wrapper.classList.add("highlight");
        brush.setLevel(level);
    };
    level1Wrapper.addEventListener("click", event => changeLevel(level1Wrapper, 1));
    level2Wrapper.addEventListener("click", event => changeLevel(level2Wrapper, 2));
    level3Wrapper.addEventListener("click", event => changeLevel(level3Wrapper, 3));
    level4Wrapper.addEventListener("click", event => changeLevel(level4Wrapper, 4));

    /* load canvas and setting events */
    let mode = Mode.HOVER;
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");
    canvas.width = img_width;
    canvas.height = img_height;


    let clearCanvas = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    let drawBackground = () => {
        ctx.drawImage(drawing.getImage(), 0, 0);
    };
    
    canvas.addEventListener("mouseenter", event => {
        mode = Mode.HOVER;
    });

    canvas.addEventListener("mouseleave", event => {
        mode = Mode.HOVER;
    });

    canvas.addEventListener("mousedown", event => {
        mode = Mode.DRAW;
    });

    canvas.addEventListener("mouseup", event => {
        mode = Mode.HOVER;
    });

    canvas.addEventListener("mousemove", event => {
        let currX = event.pageX - canvas.offsetLeft;
        let currY = event.pageY - canvas.offsetTop;
        let prevX = currX - event.movementX;
        let prevY = currY - event.movementY;
        let width = brush.getLevel();

        if (mode == Mode.DRAW) {
            ctx.beginPath();
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(currX, currY);
            ctx.strokeStyle = brush.getColor().formatString();
            ctx.lineWidth = width;
            ctx.stroke();
            ctx.closePath();
        }
    });


    /* initialize canvas */
    drawBackground();
};
