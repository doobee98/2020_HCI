
class Color {
    constructor(rgb, alpha=0x00) {
        this.rgb = rgb;
        this.alpha = alpha;
    }

    toString() {
        if (this.alpha == 0xFF) return "Transparent";
        else return `(0x${this.rgb.toString(16)}, 0x${this.alpha.toString(16)})`;
    }
}


let ColorEnum = Object.freeze({
    RED: new Color(0xFF0000, 0x00),
    GREEN: new Color(0x00FF00, 0x00),
    BLUE: new Color(0x0000FF, 0x00),
    WHITE: new Color(0x000000, 0x00),
    BLACK: new Color(0xFFFFFF, 0x00),
    GRAY: new Color(0x808080, 0x00),
    TRANSPARENT: new Color(0x000000, 0xFF),
});

export { Color, ColorEnum };
