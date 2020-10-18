
import Model from './model.js'


let jsonTextArea = document.getElementById("json");


function tree2json(tree, event) {
    jsonTextArea.value = JSON.stringify(tree, null, 2);
}

function json2tree(event) {
    const TempCount = Model.Node.count;
    let tree = new Model.Tree();
    
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
        if (node instanceof Model.Button && json.property.$group_id) {
            let group = findNode(json.property.$group_id);
            if (group) {
                group.addButton(node);
            }
        } 

        // window load
        if (node instanceof Model.Window) {
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

    Model.Node.count = TempCount;
    return tree;
}

function json2node(json) {
    switch (json.type) {
        case "Node": return Model.Node.fromJSON(json);
        case "PointNode": return Model.PointNode.fromJSON(json);
        case "LineNode": return Model.LineNode.fromJSON(json);
        case "AreaNode": return Model.AreaNode.fromJSON(json);
        case "WrapperBox": return Model.WrapperBox.fromJSON(json);
        case "TextBox": return Model.TextBox.fromJSON(json);
        case "Label": return Model.Label.fromJSON(json);
        case "Button": return Model.Button.fromJSON(json);
        case "RadioButton": return Model.RadioButton.fromJSON(json);
        case "CheckBox": return Model.CheckBox.fromJSON(json);
        case "ButtonGroup": return Model.ButtonGroup.fromJSON(json);
        case "Window": return Model.Window.fromJSON(json);
        default: throw Error(`Unexpected Type: ${json.type}`);
    }
}

export { tree2json, json2tree };
