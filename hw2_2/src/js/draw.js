import Model from './model.js'


let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

function q(n, d) { return Math.floor(n / d); }



function draw(node, x, y, recursive=true) {
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
    if (node.shape == Model.Shape.CIRCLE) {
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


export default draw;
