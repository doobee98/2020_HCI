import Model from './model.js'
import { draw, registerCanvas, focusNode } from './canvas.js'

import { make_complex_example } from './example.js'

import { tree2json, json2tree } from './parser.js';


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
    tree = new Model.Tree();
    let main = new Model.WrapperBox(1000, 1200);
    main.shape = Model.Shape.RECTANGLE;

    // hw2-1 complex example 창 생성
    let window1 = make_complex_example();
    window1.titleBox.text.data = "1번째 윈도우";
    window1.pos = new Model.Point(50, 200);
    main.addChild(window1);

    let window2 = make_complex_example();
    window2.titleBox.text.data = "2번째 윈도우";
    window2.pos = new Model.Point(100, 250);
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
