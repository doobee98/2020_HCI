import Node from './node.js'


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

export default Tree;
