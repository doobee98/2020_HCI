import Point from './point.js'


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

export default Node;
