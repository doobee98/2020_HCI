import Point from './point.js'


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

export default Node;
