
class Color {
    constructor(rgb, a=0x00) {
        this.rgb = rgb;
        this.a = a;
    }

    get r() { return parseInt(this.rgb / 0x10000); }
    set r(c) { this.rgb = c * 0x10000 + this.g * 0x100 + this.b; }
    get g() { return parseInt((this.rgb % 0x10000) / 0x100); }
    set g(c) { this.rgb = this.r * 0x10000 + c * 0x100 + this.b; }
    get b() { return parseInt(this.rgb % 0x100); }
    set b(c) { this.rgb = this.r * 0x10000 + this.g * 0x100 + c; }

    toString() {
        if (this.alpha == 0xFF) return "Transparent";
        else return `(0x${this.rgb.toString(16)}, 0x${this.a.toString(16)})`;
    }

    formatString() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }
}


let ColorEnum = Object.freeze({
    RED: new Color(0xFF0000, 0xFF),
    GREEN: new Color(0x00FF00, 0xFF),
    BLUE: new Color(0x0000FF, 0xFF),
    WHITE: new Color(0xFFFFFF, 0xFF),
    BLACK: new Color(0x000000, 0xFF),
    GREY: new Color(0x808080, 0xFF),
    LIGHTGREY: new Color(0xd3d3d3, 0xFF),
    TRANSPARENT: new Color(0xFFFFFF, 0x00),
});

export { Color, ColorEnum };
