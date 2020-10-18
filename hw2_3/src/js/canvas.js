import Model from './model.js'


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
    let pos = new Model.Point(x, y);

    if (node instanceof Model.PointNode) {
        drawPointNode(node, pos);
    }
    else if (node instanceof Model.LineNode) {
        drawLineNode(node, pos);
    }
    else if (node instanceof Model.AreaNode) {
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
    if (node.shape == Model.Shape.CIRCLE) {
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

    if (node.shape == Model.Shape.NONE) {
        ctx.strokeStyle = Model.ColorEnum.TRANSPARENT.formatString();
    }
        
    ctx.fill();
    ctx.stroke();

    if (node.text) {
        let x, y;
        switch (node.text.horizontalAlign) {
            case Model.Align.START: 
                ctx.textAlign = "start";
                x = pos.x;
                break;
            case Model.Align.END:
                ctx.textAlign = "end";
                x = pos.x + node.width;
                break;
            case Model.Align.CENTER: 
                ctx.textAlign = "center";
                x = pos.x + q(node.width, 2);
                break;
        }
        switch (node.text.verticalAlign) {
            case Model.Align.TOP: 
                ctx.textBaseline = "top";
                y = pos.y;
                break;
            case Model.Align.BOTTOM:
                ctx.textBaseline = "bottom";
                y = pos.y + node.height;
                break;
            case Model.Align.MIDDLE: 
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
            if (curNode instanceof Model.AreaNode) {
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
        let node = findNodeFromPos(new Model.Point(x, y));
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
            let pos = new Model.Point(x, y);
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
            let curPos = new Model.Point(curX, curY);

            dragNode.onMousemoveEvent(event, curPos, prevDraggedPos);
            prevDraggedPos = curPos;
            redraw(tree);
        }
    });
}


export { draw, registerCanvas, focusNode };
