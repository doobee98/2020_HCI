import Node from './node.js'
import Point from './point.js'
import { Color, ColorEnum } from './color.js'


const Shape = Object.freeze({
    NONE: 'None',
    RECTANGLE: 'Rectangle',
    CIRCLE: 'Circle',
})


class PointNode extends Node {
    constructor(pos=Point.origin(), parent=null) {
        super(parent);
        this.pos = pos;
    }

    static fromJSON(json) {
        // No Parent, ChildList
        let node = new PointNode();
        node.id = json.property.id;
        node.pos = Point.fromString(json.property.pos);
        node.hasFocus = json.property.hasFocus;
        return node;
    }
}


class LineNode extends Node {
    constructor(start=Point.origin(), end=Point.origin(), parent=null) {
        super(parent);
        this.start = start;
        this.end = end;
        this.pos = start;
    }

    get length() { return this.start.distance(this.end); }

    toString(indent=0) {
        return super.toString(indent) + Node.indentFormat(indent, [
            `Start: ${this.start.toString()}`,
            `End  : ${this.end.toString()}`,
        ]);
    }

    toJSON() {
        return {
            "type": this.type,
            "property": {
                ...super.toJSON().property,
                "start": this.start.toString(),
                "end": this.end.toString(),
            },
            "childList": super.toJSON().childList,
        }
    }

    static fromJSON(json) {
        // No Parent, ChildList
        let node = new LineNode(Point.fromString(json.property.start), Point.fromString(json.property.end));
        node.id = json.property.id;
        node.pos = Point.fromString(json.property.pos);
        node.hasFocus = json.property.hasFocus;
        return node;
    }
}


class AreaNode extends Node {
    constructor(width, height, parent=null) {
        super(parent);
        this.shape = Shape.RECTANGLE;
        this.width = width;
        this.height = height;
        this.borderColor = ColorEnum.BLACK;
        this.borderWidth = 2;   // TODO: 잘 보이게 하려고 2로 함
        this.bgColor = ColorEnum.TRANSPARENT;
    }

    get center() { return new Point(parseInt(this.width / 2), parseInt(this.height / 2)); }
    get absoluteCenter() { return this.pos.add(this.center); }
    get rightPos() { return this.pos.move(this.width, 0); }
    get downPos() { return this.pos.move(0, this.height); }

    hasPos(pos) {
        return pos.x >= this.x && pos.x <= this.x + this.width 
            && pos.y >= this.y && pos.y <= this.y + this.height;
    }

    hasAbsolutePos(pos) {
        return pos.x >= this.absolutePos.x && pos.x <= this.absolutePos.x + this.width 
            && pos.y >= this.absolutePos.y && pos.y <= this.absolutePos.y + this.height;
    }

    toString(indent=0) {
        return super.toString(indent) + Node.indentFormat(indent, [
            `Shape : ${this.shape}`,
            `Width : ${this.width}`,
            `Height: ${this.height}`,
            `BorderColor: ${this.borderColor.toString()}`,
            `BorderWidth: ${this.borderWidth}`,
            `BackGround: ${this.bgColor.toString()}`, 
        ]);
    }

    toJSON() {
        return {
            "type": this.type,
            "property": {
                ...super.toJSON().property,
                "shape": this.shape,
                "width": this.width,
                "height": this.height,
                "borderColor": this.borderColor.toString(),
                "borderWidth": this.borderWidth,
                "bgColor": this.bgColor.toString(),
            },
            "childList": super.toJSON().childList,
        }
    }

    static fromJSON(json) {
        // No Parent, ChildList
        let node = new AreaNode(json.property.width, json.property.height);
        node.id = json.property.id;
        node.pos = Point.fromString(json.property.pos);
        node.hasFocus = json.property.hasFocus;
        node.shape = json.property.shape;
        node.borderColor = Color.fromString(json.property.borderColor);
        node.borderWidth = json.property.borderWidth;
        node.bgColor = Color.fromString(json.property.bgColor);
        return node;
    }
}


export { Shape, PointNode, LineNode, AreaNode };
