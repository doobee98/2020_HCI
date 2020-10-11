import { ColorEnum } from './color.js'
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


export { WrapperBox, Label, TextBox, 
         Button, RadioButton, CheckBox, ButtonGroup,
         Window, };
