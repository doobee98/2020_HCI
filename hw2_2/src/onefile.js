

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

    fontFormatString() {
        return `${this.bold ? "bold " : ""}${this.size}pt ${this.font}`;
    }
}


class Node {
    static count = 0;
    static new_id() { Node.count += 1; return Node.count; }

    // For Debugging and Visualization
    static stack = [];
    static ID(id) { return Node.stack.find(node => node.id == id); }

    constructor(parent=null) {
        this.id = Node.new_id();
        this.parent = parent;
        this.childSet = new Set();
        this.pos = Point.origin();

        // For Debugging and Visualization
        Node.stack.push(this);

        if (parent != null) {
            parent.addChild(this);
        }
    }

    get type() { return this.constructor.name; }

    get x() { return this.pos.x; }
    set x(value) { this.pos.x = value; }
    get y() { return this.pos.y; }
    set y(value) { this.pos.y = value; }

    get absolutePos() { return (this.is_root()? this.pos : this.pos.add(this.parent.pos)); }
    set absolutePos(_pos) { this.pos = (this.is_root()? _pos : _pos.sub(this.parent.pos)); }

    is_root() { return this.parent == null; }
    is_leaf() { return this.childSet.size == 0; }

    move(x, y) { this.x += x; this.y += y; }

    addChild(node) {
        this.childSet.add(node);
        node.parent = this;
    }

    deleteChild(node) {
        if (this.childSet.has(node)) {
            this.childSet.delete(node);
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
            `ParentID: ${this.is_root()? "ROOT" : this.parent.id}`,
            `ChildSet: [${[...this.childSet].map(child => child.id).join(", ")}]`,
            `Position: ${this.pos.toString()}`,
        ]);               
    }

    print() { console.log(this.toString()); }
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
                worklist = [...worklist, ...node.childSet];
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
                worklist = [...worklist, ...node.childSet];
            }
        }
        return result;
    }

    toString(indent=2) {
        if (this.is_empty()) return "Empty Tree";
        
        let result = [];
        let loop = (node, cur_indent) => {
            result.push(node.toString(cur_indent));
            for (let child of node.childSet) {
                loop(child, cur_indent + indent);
            }
        };
        loop(this.root, 0);
        return result.join("\n");
    }

    print() { console.log(this.toString()); }
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


class WrapperBox extends AreaNode {
    constructor(width, height, parent=null) {
        super(width, height, parent);
        this.bgColor = ColorEnum.TRANSPARENT;
        this.shape = Shape.NONE;
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
}

class Label extends TextBox {
    constructor(width=50, height=50, text="Label", parent=null) {
        super(width, height, text, parent);
        this.borderColor = ColorEnum.TRANSPARENT;
        this.borderWidth = 0;
    }
}


/* Button Classes */
class Button extends TextBox {
    constructor(width=100, height=30, text="Push", parent=null) {
        super(width, height, text, parent);
        this.value = 0;
        this.group = null;
        this.text.horizontalAlign = Align.CENTER;
    }

    get groupName() { return (this.group == null? "" : this.group.name); }
    get groupID() { return (this.group == null? -1 : this.group.index(this)); }

    toString(indent=0) {
        return super.toString(indent) + Node.indentFormat(indent, [
            `Group: ${this.groupName}`,
            `Value: ${this.value}`,
        ]);
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
        
        // TODO: 지금은 간단하게 구현하고, 아직 사용하지 않음
        this.myClickEvent = (value) => {
            if (value == 1) this.text.data = "●";
            else if (value == 0) this.text.data = " ";
        };
    }
}

class CheckBox extends Button {
    constructor(parent=null) {
        super(20, 20, "", parent);

        // TODO: 지금은 간단하게 구현하고, 아직 사용하지 않음
        this.myClickEvent = (value) => {
            if (value == 1) this.text.data = "✔";
            else if (value == 0) this.text.data = " ";
        };
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
        this.closeButton = new Button(CloseButtonWidth, TitleHeight, "X", this.titleBox);
        this.closeButton.move(width - CloseButtonWidth, 0);
        this.closeButton.bgColor = ColorEnum.RED;
        this.closeButton.text.color = ColorEnum.WHITE;
        this.closeButton.text.horizontalAlign = Align.CENTER;

        this.contentBox = new WrapperBox(width, height-TitleHeight, this);
        this.contentBox.move(0, TitleHeight);
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
    let namebox = new WrapperBox(LineWidth, LineHeight, window.contentBox)
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



function draw(node, x, y, recursive=true) {
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
    if (recursive) {
        for (let child of node.childSet) {
            draw(child, x + node.x, y + node.y);
        }
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

    ctx.lineWidth = node.borderWidth;
    ctx.strokeStyle = node.borderColor.formatString();
    ctx.fillStyle = node.bgColor.formatString();

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



/* Main Window 구성 */
let tree = new Tree();
let main = new WrapperBox(1000, 1200);
tree.root = main;

// hw2-1 simple example 창 생성
let window1 = make_simple_example();
window1.pos = Point.origin().move(10, 10);
main.addChild(window1);

// hw2-2 complex example 창 생성
let window2 = make_complex_example();
window2.pos = window1.downPos.move(0, 20);
main.addChild(window2);

// lineNode 생성 및 좌표잡기
let line = new LineNode();
line.start = window2.downPos.move(50, 50);
line.end = line.start.move(100, 10);
main.addChild(line);

// areaNode 생성 후 모양을 Ellipse로 변경하기
let ellipse = new AreaNode(50, 80);
ellipse.shape = Shape.CIRCLE;
ellipse.pos = window2.downPos.move(200, 30);
ellipse.borderColor = ColorEnum.BLUE;
main.addChild(ellipse);

// 위에서 만든 ellipse의 중점에 pointNode 자식으로 추가
let point = new PointNode();
point.pos = ellipse.center;
ellipse.addChild(point);

// (root) main window draw
draw(tree.root, 0, 0);
console.log(tree.toString());
