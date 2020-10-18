

class Point {
    static origin() { return new Point(0, 0); }
    
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    move(x, y) { return new Point(this.x + x, this.y + y); }
    add(otherPos) { return new Point(this.x + otherPos.x, this.y + otherPos.y); }
    sub(otherPos) { return new Point(this.x - otherPos.x, this.y - otherPos.y); }
    neg() { return new Point(-this.x, -this.y); }
    mid(otherPos) { 
        let tempPos = this.add(otherPos);
        return new Point(parseInt(tempPos.x / 2), parseInt(tempPos.y / 2));
    }
    
    distance(other) {
        return (Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2)));
    }

    toString() {
        return `(${this.x}, ${this.y})`;
    }

    static fromString(str) {
        let [x, y] = str.match(/-?\d+/g);
        return new Point(parseInt(x), parseInt(y));
    }
}


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
        if (this.a == 0x00) return "Transparent";
        else return `(0x${this.rgb.toString(16)}, 0x${this.a.toString(16)})`;
    }

    static fromString(str) {
        if (str == "Transparent") return ColorEnum.TRANSPARENT;

        let [rgb, a] = str.match(/0x([abcdef\d]+)/g);
        return new Color(parseInt(rgb), parseInt(a));
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


const Align = Object.freeze({
    TOP: 'Start',
    MIDDLE: 'Center',
    BOTTOM: 'End',
    START: 'Start',
    CENTER: 'Center',
    END: 'End',
})


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


class Node {
    static count = 0;
    static new_id() { Node.count += 1; return Node.count; }

    constructor(parent=null) {
        this.id = Node.new_id();
        this.parent = parent;
        this.childList = [];
        this.pos = Point.origin();
        this.hasFocus = false;

        if (parent != null) {
            parent.addChild(this);
        }
    }

    get type() { return this.constructor.name; }

    get x() { return this.pos.x; }
    set x(value) { this.pos.x = value; }
    get y() { return this.pos.y; }
    set y(value) { this.pos.y = value; }

    get absolutePos() { return (this.is_root()? this.pos : this.pos.add(this.parent.absolutePos)); }
    set absolutePos(_pos) { this.pos = (this.is_root()? _pos : _pos.sub(this.parent.absolutePos)); }

    get root() {
        let curNode = this;
        while (!curNode.is_root()) { curNode = curNode.parent; };
        return curNode;
    }

    is_root() { return this.parent == null; }
    is_leaf() { return this.childList.length == 0; }

    move(x, y) { this.x += x; this.y += y; }

    addChild(node) {
        if (this.childList.includes(node)) {
            return;
        }
        this.childList.push(node);
        node.parent = this;
    }

    deleteChild(node) {
        if (this.childList.includes(node)) {
            this.childList.splice(this.childList.indexOf(node), 1);
            node.parent = null;
        }
        else {
            throw Error("Node.deleteChild(node): arg node is not a child of this node");
        }
    }

    static indentFormat(indent, stringList) {
        let indent_str = " ".repeat(indent);
        return stringList.map(str => indent_str + str).join("\n") + "\n";
    }

    toString(indent=0) {
        return Node.indentFormat(indent, [
            `ID: ${this.id}`, 
            `Type: ${this.type}`,
            `ParentID : ${this.is_root()? "ROOT" : this.parent.id}`,
            `ChildList: [${this.childList.map(child => child.id).join(", ")}]`,
            `Position : ${this.pos.toString()}`,
        ]);               
    }

    print() { console.log(this.toString()); }

    toJSON() {
        return {
            "type": this.type,
            "property": {
                "id": this.id,
                "$parent_id": this.parent? this.parent.id : null,
                "pos": this.pos.toString(),
                "hasFocus": this.hasFocus,
            }, 
            "childList": this.childList.map(child => child.toJSON()),
        };
    }

    static fromJSON(json) {
        // No Parent, ChildList
        let node = new Node();
        node.id = json.property.id;
        node.pos = Point.fromString(json.property.pos);
        node.hasFocus = json.property.hasFocus;
        return node;
    }
}


class Tree {
    constructor() {
        this.root = null;
    }

    assert_mem(node, value) {
        let ERROR = () => {
            throw Error("Tree.assert_mem(node, value): arg node membership assertion failed");
        };

        if (this.is_empty()) {
            if (value) ERROR();
            else return;
        }
        
        while (node.parent != null) {
            node = node.parent;
        }
        
        if ((node == this.root) != value) ERROR();
    }

    is_empty() { return this.root == null; }

    add_node(parent, node) {
        this.assert_mem(node, false);
        if (parent == null) {
            this.root = node;
        }
        else {
            this.assert_mem(parent, true);   
            parent.addChild(node);
        }

    }

    delete_node(node) {
        this.assert_mem(node, true);

        if (node.is_root()) {
            this.root = null;
        }
        else {
            let parent = node.parent;
            parent.deleteChild(node);
        }
    }

    search_node(node_func) {
        if (!this.is_empty()) {
            let worklist = [this.root];
            while (worklist.length != 0) {
                let node = worklist.shift();
                if (node_func(node) == true) return node;
                worklist = workList.concat(node.childList);
            }
        }
        return null;
    }

    search_node_all(node_func) {
        let result = [];
        if (!this.is_empty()) {
            let worklist = [this.root];
            while (worklist.length != 0) {
                let node = worklist.shift();
                if (node_func(node)) result.push(node);
                worklist = worklist.concat(node.childList);
            }
        }
        return result;
    }

    toString(indent=2) {
        if (this.is_empty()) return "Empty Tree";
        
        let result = [];
        let loop = (node, cur_indent) => {
            result.push(node.toString(cur_indent));
            for (let child of node.childList) {
                loop(child, cur_indent + indent);
            }
        };
        loop(this.root, 0);
        return result.join("\n");
    }

    print() { console.log(this.toString()); }

    toJSON() {
        return this.root.toJSON();
    }
}


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


class WrapperBox extends AreaNode {
    constructor(width, height, parent=null) {
        super(width, height, parent);
        this.bgColor = ColorEnum.TRANSPARENT;
        this.shape = Shape.NONE;
    }

    static fromJSON(json) {
        // No Parent, ChildList
        let node = new WrapperBox(json.property.width, json.property.height);
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

class TextBox extends AreaNode {
    constructor(width=100, height=50, text="TextBox", parent=null) {
        super(width, height, parent);
        this.bgColor = ColorEnum.WHITE;
        this.text = new Text(text);
    }

    toString(indent=0) {
        return super.toString(indent) + Node.indentFormat(indent, [
            `Text : "${this.text.toString()}"`,
        ]);
    }

    toJSON() {
        return {
            "type": this.type,
            "property": {
                ...super.toJSON().property,
                "text": this.text.toJSON(),
            },
            "childList": super.toJSON().childList,
        }
    }

    static fromJSON(json) {
        // No Parent, ChildList
        let node = new TextBox(json.property.width, json.property.height);
        node.id = json.property.id;
        node.pos = Point.fromString(json.property.pos);
        node.hasFocus = json.property.hasFocus;
        node.shape = json.property.shape;
        node.borderColor = Color.fromString(json.property.borderColor);
        node.borderWidth = json.property.borderWidth;
        node.bgColor = Color.fromString(json.property.bgColor);
        node.text = Text.fromJSON(json.property.text);

        return node;
    }
}

class Label extends TextBox {
    constructor(width=50, height=50, text="Label", parent=null) {
        super(width, height, text, parent);
        this.borderColor = ColorEnum.TRANSPARENT;
        this.borderWidth = 0;
    }

    static fromJSON(json) {
        // No Parent, ChildList
        let node = new Label(json.property.width, json.property.height);
        node.id = json.property.id;
        node.pos = Point.fromString(json.property.pos);
        node.hasFocus = json.property.hasFocus;
        node.shape = json.property.shape;
        node.borderColor = Color.fromString(json.property.borderColor);
        node.borderWidth = json.property.borderWidth;
        node.bgColor = Color.fromString(json.property.bgColor);
        node.text = Text.fromJSON(json.property.text);
        return node;
    }
}


/* Button Classes */
class Button extends TextBox {
    constructor(width=100, height=30, text="Push", parent=null) {
        super(width, height, text, parent);
        this.value = 0;
        this.group = null;
        this.text.horizontalAlign = Align.CENTER;

        this.onClickEvent = () => { }
    }

    get groupName() { return (this.group == null? "" : this.group.name); }
    get groupID() { return (this.group == null? -1 : this.group.index(this)); }

    toggle() { this.value == 0? this.set(1) : this.set(0);}
    set(value) { 
        this.value = value; 
        if (this.group) {
            this.group.callback(this);
        }
    }

    toString(indent=0) {
        return super.toString(indent) + Node.indentFormat(indent, [
            `Group: ${this.groupName}`,
            `Value: ${this.value}`,
        ]);
    }

    toJSON() {
        return {
            "type": this.type,
            "property": {
                ...super.toJSON().property,
                "value": this.value,
                "$group_id": this.group? this.group.id : null,
            },
            "childList": super.toJSON().childList,
        }
    }

    static fromJSON(json) {
        // No Parent, ChildList
        let node = new Button(json.property.width, json.property.height);
        node.id = json.property.id;
        node.pos = Point.fromString(json.property.pos);
        node.hasFocus = json.property.hasFocus;
        node.shape = json.property.shape;
        node.borderColor = Color.fromString(json.property.borderColor);
        node.borderWidth = json.property.borderWidth;
        node.bgColor = Color.fromString(json.property.bgColor);
        node.text = Text.fromJSON(json.property.text);
        node.value = json.property.value;
        return node;
    }
}

// class PushButton extends Button {
//     constructor(width, height, text="Push", parent=null) {
//         super(width, height, text, parent);
//     }
// }

class RadioButton extends Button {
    constructor(parent=null) {
        super(20, 20, "", parent);
        this.shape = Shape.CIRCLE;
        this.onClickEvent = () => { this.toggle(); }
    }

    set(value) {
        super.set(value);
        this.text.data = value == 0? " " : "●";
    }
}

class CheckBox extends Button {
    constructor(parent=null) {
        super(20, 20, "", parent);
        this.onClickEvent = () => { this.toggle(); }
    }

    set(value) {
        super.set(value);
        this.text.data = value == 0? " " : "✔";
    }
}

class ButtonGroup extends WrapperBox {
    constructor(name, width, height, parent=null) {
        super(width, height, parent);
        this.name = name;
        this.isExclusive = false;
        this.buttonSet = new Set();
    }

    get size() { return this.buttonSet.size; }

    index(button) { return [...this.buttonSet].indexOf(button); }
    addButton(button) { this.buttonSet.add(button); button.group = this; }
    deleteButton(button) { this.buttonSet.delete(button); button.group = null; }

    callback(button) {
        if(this.isExclusive && button.value != 0 ) {
            for (let membtn of this.buttonSet) {
                if (membtn != button) {
                    membtn.set(0);
                }
            }
        }
    }

    toJSON() {
        return {
            "type": this.type,
            "property": {
                ...super.toJSON().property,
                "name": this.name,
                "isExclusive": this.isExclusive,
                "$buttonIDSet": [...this.buttonSet].map(node => node.id),
            },
            "childList": super.toJSON().childList,
        }
    }

    static fromJSON(json) {
        // No Parent, ChildList
        let node = new ButtonGroup(json.property.name, json.property.width, json.property.height);
        node.id = json.property.id;
        node.pos = Point.fromString(json.property.pos);
        node.hasFocus = json.property.hasFocus;
        node.shape = json.property.shape;
        node.borderColor = Color.fromString(json.property.borderColor);
        node.borderWidth = json.property.borderWidth;
        node.bgColor = Color.fromString(json.property.bgColor);
        node.isExclusive = json.property.isExclusive;
        return node;
    }
}


/* Window Classes */
class Window extends WrapperBox {
    constructor(title, width, height, parent=null) {
        super(width, height, parent);
        this.bgColor = ColorEnum.GREY;
        this.shape = Shape.RECTANGLE;

        const TitleHeight = 30;
        const CloseButtonWidth = 30;

        this.titleBox = new TextBox(width, TitleHeight, title, this);
        this.titleBox.text.bold = true;
        this.titleBox.text.size = 13;
        this.titleBox.onMousemoveEvent = (event, newPos, oldPos) => {
            // root일때는 parent가 없지만, 항상 abstract wrapper가 감싸고 있다는 가정
            if (this.parent == null) {
                throw Error("Window.onClickEvent: this window is root node");
            }
            this.pos = this.pos.add(newPos.sub(oldPos));
        }

        this.closeButton = new Button(CloseButtonWidth, TitleHeight, "X", this.titleBox);
        this.closeButton.move(width - CloseButtonWidth, 0);
        this.closeButton.bgColor = ColorEnum.RED;
        this.closeButton.text.color = ColorEnum.WHITE;
        this.closeButton.text.horizontalAlign = Align.CENTER;
        this.closeButton.onClickEvent = (event) => {
            // 항상 abstract wrapper가 감싸고 있다는 가정
            if (this.parent == null) {
                throw Error("Window.closeButton.onClickEvent: this window is root node");
            }
            this.parent.deleteChild(this);
        }

        this.contentBox = new WrapperBox(width, height-TitleHeight, this);
        this.contentBox.move(0, TitleHeight);

        // focus event
        this.onFocusOnEvent = (event) => { this.highlightBorder(true); };
        this.onFocusOutEvent = (event) => { this.highlightBorder(false); };

        // for highlighting - additional property
        this.highlightBorder = (flag) => {
            const Highlight = { color: ColorEnum.RED, width: 10 };
            let selfFunc = this.highlightBorder;

            // define static variable for original border value
            if (typeof selfFunc.border == 'undefined') {
                selfFunc.border = { color: this.borderColor, width: this.borderWidth };
            }

            if (flag) {
                selfFunc.border = { color: this.borderColor, width: this.borderWidth };
                this.borderColor = Highlight.color;
                this.borderWidth = Highlight.width;
            }
            else {
                this.borderColor = selfFunc.border.color;
                this.borderWidth = selfFunc.border.width;
            }
        };
    }

    toJSON() {
        return {
            "type": this.type,
            "property": {
                ...super.toJSON().property,
                "$titleBox_id": this.titleBox? this.titleBox.id : null,
                "$closeButton_id": this.closeButton? this.closeButton.id : null,
                "$contentBox_id": this.contentBox? this.contentBox.id : null,
            },
            "childList": super.toJSON().childList,
        }
    }

    static fromJSON(json) {
        // No Parent, ChildList
        let node = new Window("", json.property.width, json.property.height);
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


function make_simple_example() {
    let title = new TextBox(800, 50, "TextTitle");
    let content = new WrapperBox(800, 450);
    content.shape = Shape.RECTANGLE;
    let button = new Button(50, 50, "X");
    button.text.color = ColorEnum.RED;
    button.shape = Shape.CIRCLE;
    let wrap = new WrapperBox(800, 500);

    wrap.addChild(title);
    wrap.addChild(content);
    title.addChild(button);

    content.pos = title.downPos;
    button.pos = title.rightPos.move(-button.width, 0);

    return wrap;
}


function make_simple_example() {
    let title = new TextBox(800, 50, "TextTitle");
    let content = new WrapperBox(800, 450);
    content.shape = Shape.RECTANGLE;
    let button = new Button(50, 50, "X");
    button.text.color = ColorEnum.RED;
    button.shape = Shape.CIRCLE;
    let wrap = new WrapperBox(800, 500);

    wrap.addChild(title);
    wrap.addChild(content);
    title.addChild(button);

    content.pos = title.downPos;
    button.pos = title.rightPos.move(-button.width, 0);

    return wrap;
}


function make_complex_example() { 
    // 설문조사 폼 길이 상수들
    const LineWidth = 800;
    const LineHeight = 40;
    const LeftWidth = 70;
    const RightWidth = 700;
    const IndentWidth = 10;
    const IndentHeight = 30;

    // 전체 메인 윈도우
    let window = new Window("HCI HW2-2 예시 MainWindow", LineWidth, 500);
    window.closeButton.shape = Shape.CIRCLE;

    // 설문조사 폼 헤더
    let headerBox = new Label(window.width, 50, "설문조사지", window.contentBox);
    headerBox.bgColor = ColorEnum.GREEN;
    headerBox.text.color = ColorEnum.RED;
    headerBox.text.size = 13;
    headerBox.text.bold = true;

    // 설문조사 폼 - 이름 필드
    let namebox = new WrapperBox(LineWidth-2*IndentWidth, LineHeight, window.contentBox)
    let namelbl = new Label(LeftWidth, LineHeight, "이름", namebox);
    let nametxt = new TextBox(RightWidth, LineHeight, "홍길동", namebox);
    namebox.pos = headerBox.downPos.move(IndentWidth, IndentHeight);
    nametxt.pos = namelbl.rightPos.move(IndentWidth, 0);

    // 설문조사 폼 - 성별 필드
    let genderlbl = new Label(LeftWidth, LineHeight, "성별", window.contentBox);
    let genderGroup = new ButtonGroup("Gender", RightWidth, LineHeight, window.contentBox);
    genderlbl.pos = namebox.downPos.move(0, IndentHeight);
    genderGroup.pos = genderlbl.rightPos.move(IndentWidth, 0);
    genderGroup.isExclusive = true;

    // 설문조사 폼 - 성별 필드 - 서브그룹 (라벨, 라디오버튼)
    let malelbl = new Label(50, LineHeight, "남성", genderGroup);
    let maleButton = new RadioButton(genderGroup);
    let femalelbl = new Label(50, LineHeight, "여성", genderGroup);
    let femaleButton = new RadioButton(genderGroup);
    malelbl.pos = maleButton.rightPos.move(IndentWidth, 0);
    femaleButton.pos = malelbl.rightPos.move(IndentWidth, 0);
    femalelbl.pos = femaleButton.rightPos.move(IndentWidth, 0);
    malelbl.textHorizontalAlign = Align.MIDDLE;
    femalelbl.textHorizontalAlign = Align.MIDDLE;
    genderGroup.addButton(maleButton);
    genderGroup.addButton(femaleButton);

    // 설문조사 폼  - 선호기업 필드
    let preferlbl = new Label(LeftWidth, LineHeight, "선호기업", window.contentBox);
    let preferGroup = new ButtonGroup("Preference", RightWidth, LineHeight, window.contentBox);
    preferlbl.pos = genderlbl.downPos.move(0, IndentHeight);
    preferGroup.pos = preferlbl.rightPos.move(IndentWidth, 0);
    preferGroup.isExclusive = false;

    // 설문조사 폼 - 선호기업 필드 - 서브그룹 (목록)
    const ItemList = ["Apple", "Samsung", "Kakao"];
    let currentPos = Point.origin();
    for (let item of ItemList) {
        let itemCheckBox = new CheckBox(preferGroup);
        itemCheckBox.pos = currentPos;
        let itemlbl = new Label(50, LineHeight, item, preferGroup);
        itemlbl.pos = itemCheckBox.rightPos.move(IndentWidth, 0);
        itemlbl.textHorizontalAlign = Align.MIDDLE;
        preferGroup.addButton(itemCheckBox);

        currentPos = itemlbl.rightPos.move(IndentWidth, 0);
    }

    // 설문조사 폼  - 제출 필드
    let submitButton = new Button(200, LineHeight, "제출", window.contentBox);
    let cancelButton = new Button(200, LineHeight, "취소", window.contentBox);
    submitButton.pos = preferlbl.downPos.move(100, IndentHeight);
    cancelButton.pos = submitButton.rightPos.move(200, 0);

    return window;
}

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

function q(n, d) { return Math.floor(n / d); }



function refreshCanvas() {
    let oldCanvas = canvas;
    canvas = canvas.cloneNode(true);
    oldCanvas.parentNode.replaceChild(canvas, oldCanvas);
    ctx = canvas.getContext("2d");
}

function draw(tree) {
    drawNode(tree.root, 0, 0);
}

function redraw(tree) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw(tree);
}

function drawNode(node, x, y) {
    let pos = new Point(x, y);

    if (node instanceof PointNode) {
        drawPointNode(node, pos);
    }
    else if (node instanceof LineNode) {
        drawLineNode(node, pos);
    }
    else if (node instanceof AreaNode) {
        drawAreaNode(node, pos);
    }

    // Recursive Draw
    let nofocusedList = [];
    let focusedList = [];

    for (let child of node.childList) {
        (child.hasFocus? focusedList : nofocusedList).push(child);
    }
    
    for (let child of nofocusedList.concat(focusedList)) {
        drawNode(child, x + node.x, y + node.y);
    }
}

function drawPointNode(node, _pos) {
    let pos = _pos.add(node.pos);

    ctx.rect(pos.x, pos.y, 1, 1);
    ctx.stroke();
}

function drawLineNode(node, _pos) {
    let start = _pos.add(node.start);
    let end = _pos.add(node.end);

    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
}

function drawAreaNode(node, _pos) {
    ctx.beginPath();
    
    let pos = _pos.add(node.pos);
    if (node.shape == Shape.CIRCLE) {
        let rX = q(node.width, 2);
        let rY = q(node.height, 2);
        let center = pos.move(rX, rY);
        ctx.ellipse(center.x, center.y, rX, rY, 0, 0, 2*Math.PI);
    }
    else {
        ctx.rect(pos.x, pos.y, node.width, node.height);
    }

    ctx.fillStyle = node.bgColor.formatString();
    ctx.lineWidth = node.borderWidth;
    ctx.strokeStyle = node.borderColor.formatString();

    if (node.shape == Shape.NONE) {
        ctx.strokeStyle = ColorEnum.TRANSPARENT.formatString();
    }
        
    ctx.fill();
    ctx.stroke();

    if (node.text) {
        let x, y;
        switch (node.text.horizontalAlign) {
            case Align.START: 
                ctx.textAlign = "start";
                x = pos.x;
                break;
            case Align.END:
                ctx.textAlign = "end";
                x = pos.x + node.width;
                break;
            case Align.CENTER: 
                ctx.textAlign = "center";
                x = pos.x + q(node.width, 2);
                break;
        }
        switch (node.text.verticalAlign) {
            case Align.TOP: 
                ctx.textBaseline = "top";
                y = pos.y;
                break;
            case Align.BOTTOM:
                ctx.textBaseline = "bottom";
                y = pos.y + node.height;
                break;
            case Align.MIDDLE: 
                ctx.textBaseline = "middle";
                y = pos.y + q(node.height, 2);
                break;
        }
        ctx.font = node.text.fontFormatString();
        ctx.fillStyle = node.text.color.formatString();
        ctx.fillText(node.text.data, x, y);
    }
}


/* Drag event value */
let dragNode = null;
let prevDraggedPos;

/* Focus event value */
let focusTopNode = null;

function refreshFocusTopNode(tree) {
    if (focusTopNode && focusTopNode.root != tree.root) {
        focusTopNode = tree.root;
    }
}

function focusNode(node, event=null) {
    let makePath = (node) => {
        let result = [node];
        let curNode = node;
        while (!curNode.is_root()) {
            curNode = curNode.parent;
            result.unshift(curNode);
        }
        return result;
    };
    let prevFocusPath = makePath(focusTopNode);
    let newFocusPath = makePath(node);

    while (prevFocusPath.length && newFocusPath.length && prevFocusPath[0] == newFocusPath[0]) {
        prevFocusPath.shift();
        newFocusPath.shift();
    }

    for (let focusOutNode of prevFocusPath) {
        focusOutNode.hasFocus = false;
        if (focusOutNode.onFocusOutEvent) {
            focusOutNode.onFocusOutEvent(event);
        }
    }

    focusTopNode = node;

    for (let focusOnNode of newFocusPath) {
        focusOnNode.hasFocus = true;
        if (focusOnNode.onFocusOnEvent) {
            focusOnNode.onFocusOnEvent(event);
        }
    }
}

function findNodeFromPos(pos) {
    let focusedNode = focusTopNode;
    let tracedNode = null;
    while (true) {
        // find cliked node which is a child of focused node - back tracking
        let result = null;
        let workList = [focusedNode].concat(focusedNode.childList.filter(n => n != tracedNode));
    
        // find clicked Node whose depth is highest
        while (workList.length > 0) {
            let curNode = workList.shift();
            
            // check current Node is being clicked
            if (curNode instanceof AreaNode) {
                if (curNode.hasAbsolutePos(pos)) {
                    result = curNode;
                }
            }

            workList = workList.concat(curNode.childList);
        }     

        if (result) return result;
        if (focusedNode.is_root()) break;
        tracedNode = focusedNode;
        focusedNode = focusedNode.parent;
    } 
    return null;
}

function registerCanvas(tree) {
    refreshCanvas();
    focusTopNode = tree.root;

    canvas.addEventListener("click", function(event) {
        refreshFocusTopNode(tree);

        let x = event.offsetX;
        let y = event.offsetY;
        let node = findNodeFromPos(new Point(x, y));
        if (node) {
            let prevFocusTopNode = focusTopNode;
            focusNode(node);

            if (node.onClickEvent) {
                node.onClickEvent(event);
                redraw(tree);
            }
            else if (prevFocusTopNode != focusTopNode) {
                redraw(tree);
            }
        }
    });

    canvas.addEventListener('mouseup', function(event) { 
        dragNode = null; 
    });
    canvas.addEventListener('mousedown', function(event) { 
        refreshFocusTopNode(tree);

        if (dragNode == null) {
            let x = event.pageX - canvas.offsetLeft;
            let y = event.pageY - canvas.offsetTop;
            let pos = new Point(x, y);
            let node = findNodeFromPos(pos);
            
            if (node) {
                let prevFocusTopNode = focusTopNode;
                focusNode(node);

                if (prevFocusTopNode != focusTopNode) {
                    redraw(tree);
                }
                if (node.onMousemoveEvent) {
                    dragNode = node;
                    prevDraggedPos = pos;
                }
            }
        }
    });
    canvas.addEventListener('mousemove', function(event) {
        if (dragNode != null) {
            let curX = event.pageX - canvas.offsetLeft;
            let curY = event.pageY - canvas.offsetTop;
            let curPos = new Point(curX, curY);

            dragNode.onMousemoveEvent(event, curPos, prevDraggedPos);
            prevDraggedPos = curPos;
            redraw(tree);
        }
    });
}


let jsonTextArea = document.getElementById("json");


function tree2json(tree, event) {
    jsonTextArea.value = JSON.stringify(tree, null, 2);
}

function json2tree(event) {
    const TempCount = Node.count;
    let tree = new Tree();

    const json = JSON.parse(jsonTextArea.value);
    let nodeList = [];
    let findNode = id => nodeList.find(node => node.id == id);

    let scanJSON = json => {
        let node = json2node(json);
        nodeList.push(node);

        // parent-child load
        let parent = findNode(json.property.$parent_id);
        if (parent) {
            parent.addChild(node);
        }
        for (let childJSON of json.childList) {
            scanJSON(childJSON);
        }

        // buttonGroup-button load
        if (node instanceof Button && json.property.$group_id) {
            let group = findNode(json.property.$group_id);
            if (group) {
                group.addButton(node);
            }
        } 

        // window load
        if (node instanceof Window) {
            node.deleteChild(node.titleBox);
            // node.deleteChild(node.closeButton);  // titleBox child
            node.deleteChild(node.contentBox);

            let titleBox = findNode(json.property.$titleBox_id);
            if (titleBox) {
                node.titleBox = titleBox;
            }

            let closeButton = findNode(json.property.$closeButton_id);
            if (closeButton) {
                node.closeButton = closeButton;
            }

            let contentBox = findNode(json.property.$contentBox_id);
            if (contentBox) {
                node.contentBox = contentBox;
            }
        }
    };
    scanJSON(json);

    tree.root = nodeList[0].root;

    Node.count = TempCount;
    return tree;
}

function json2node(json) {
    switch (json.type) {
        case "Node": return Node.fromJSON(json);
        case "PointNode": return PointNode.fromJSON(json);
        case "LineNode": return LineNode.fromJSON(json);
        case "AreaNode": return AreaNode.fromJSON(json);
        case "WrapperBox": return WrapperBox.fromJSON(json);
        case "TextBox": return TextBox.fromJSON(json);
        case "Label": return Label.fromJSON(json);
        case "Button": return Button.fromJSON(json);
        case "RadioButton": return RadioButton.fromJSON(json);
        case "CheckBox": return CheckBox.fromJSON(json);
        case "ButtonGroup": return ButtonGroup.fromJSON(json);
        case "Window": return Window.fromJSON(json);
        default: throw Error(`Unexpected Type: ${json.type}`);
    }
}



// 이벤트 등록
document.querySelector('#refreshBtn').addEventListener('click', refresh);
document.querySelector('#printBtn').addEventListener('click', print);
document.querySelector('#toJsonBtn').addEventListener('click', (event) => tree2json(tree, event));
document.querySelector('#fromJsonBtn').addEventListener('click', (event) => {
    tree = json2tree(event);
    initializeTree(tree);
});

// 트리 형성 및 초기화
let tree;
initialize();

// (root) main window draw
draw(tree);



function initialize() {
    tree = new Tree();
    let main = new WrapperBox(1000, 1200);
    main.shape = Shape.RECTANGLE;

    // hw2-1 complex example 창 생성
    let window1 = make_complex_example();
    window1.titleBox.text.data = "1번째 윈도우";
    window1.pos = new Point(50, 200);
    main.addChild(window1);

    let window2 = make_complex_example();
    window2.titleBox.text.data = "2번째 윈도우";
    window2.pos = new Point(100, 250);
    main.addChild(window2);

    tree.root = main;
    initializeTree(tree);

    // initialize focus
    focusNode(window1);
    draw(tree);
}

function initializeTree(tree) {
    registerCanvas(tree);
    focusNode(tree.root);
    draw(tree);
}

function refresh(event) {
    initialize();
    draw(tree);
}

function print(event) {
    console.log(tree.toString());
}
