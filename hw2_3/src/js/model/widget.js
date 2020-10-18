import Point from './point.js'
import { Color, ColorEnum } from './color.js'
import Node from './node.js'
import { Shape, AreaNode, } from "./figure.js"
import Align from './align.js'
import Text from './text.js'


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


export { WrapperBox, Label, TextBox, 
         Button, RadioButton, CheckBox, ButtonGroup,
         Window, };
