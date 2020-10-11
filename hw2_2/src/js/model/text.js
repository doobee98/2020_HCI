import Align from './align.js'
import { ColorEnum } from './color.js'


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

    fontFormatString() {
        return `${this.bold ? "bold " : ""}${this.size}pt ${this.font}`;
    }
}

export default Text;
