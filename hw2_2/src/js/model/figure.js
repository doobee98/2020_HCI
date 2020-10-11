import Node from './node.js'
import Point from './point.js'
import { ColorEnum } from './color.js'


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
}


export { Shape, PointNode, LineNode, AreaNode };
