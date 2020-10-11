import Model from './model.js'
import draw from './draw.js'
import { make_simple_example, make_complex_example } from './example.js'


/* Main Window 구성 */
let tree = new Model.Tree();
let main = new Model.WrapperBox(1000, 1200);
tree.root = main;

// hw2-1 simple example 창 생성
let window1 = make_simple_example();
window1.pos = Model.Point.origin().move(10, 10);
main.addChild(window1);

// hw2-2 complex example 창 생성
let window2 = make_complex_example();
window2.pos = window1.downPos.move(0, 20);
main.addChild(window2);

// lineNode 생성 및 좌표잡기
let line = new Model.LineNode();
line.start = window2.downPos.move(50, 50);
line.end = line.start.move(100, 10);
main.addChild(line);

// areaNode 생성 후 모양을 Ellipse로 변경하기
let ellipse = new Model.AreaNode(50, 80);
ellipse.shape = Model.Shape.CIRCLE;
ellipse.pos = window2.downPos.move(200, 30);
ellipse.borderColor = Model.ColorEnum.BLUE;
main.addChild(ellipse);

// 위에서 만든 ellipse의 중점에 pointNode 자식으로 추가
let point = new Model.PointNode();
point.pos = ellipse.center;
ellipse.addChild(point);

// (root) main window draw
draw(tree.root, 0, 0);
console.log(tree.toString());
