import Align from './align.js'
import { Color, ColorEnum } from './color.js'


class Text {
    constructor(data) {
        this.data = data;
        this.font = "Times New Roman"
        this.size = 10;
        this.bold = false;
        this.color = ColorEnum.BLACK;
        this.verticalAlign = Align.MIDDLE;
        this.horizontalAlign = Align.START;
    }

    toString() {
        return `${this.data} [${this.fontFormatString()}`
             + ` / Vertical: ${this.verticalAlign}]`
             + ` / Horizontal: ${this.horizontalAlign}]`;
    }

    toJSON() {
        return {
            "data": this.data,
            "font": this.font,
            "size": this.size,
            "bold": this.bold,
            "color": this.color.toString(),
            "verticalAlign": this.verticalAlign,
            "horizontalAlign": this.horizontalAlign,
        }
    }

    static fromJSON(json) {
        let text = new Text(json.data);
        text.font = json.font;
        text.size = json.size;
        text.bold = json.bold;
        text.color = Color.fromString(json.color);
        text.verticalAlign = json.verticalAlign;
        text.horizontalAlign = json.horizontalAlign;
        return text;
    }

    fontFormatString() {
        return `${this.bold ? "bold " : ""}${this.size}pt ${this.font}`;
    }
}

export default Text;
