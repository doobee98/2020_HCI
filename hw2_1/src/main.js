import Node from "./component/node.js"
import Tree from "./component/tree.js"
import Point from "./component/point.js"
import { Color, ColorEnum } from "./component/color.js"
import { Shape, AreaNode, PointNode, LineNode } from "./component/figure.js"
import { WrapperBox, TextBox, Label, Button, 
         RadioButton, CheckBox, ButtonGroup, Window, } from "./component/widget.js"


class GUI_TEST {
    constructor() {
        this.tree = null;
    }

    get nodeStack() { return Node.stack; }

    create_tree() { this.tree = new Tree(); return this.tree; } 
    clear_tree() { this.tree = null; Node.stack = []; return this.tree; }
    print_tree() { console.log(this.tree.toString()); }

    n(id) { return Node.ID(id); }

    create_node() {
        let node = null;
        let input;
        do {
            input = prompt("노드타입\n" + 
                           "(1) Graphic\n" + 
                           "(2) GUI\n" + 
                           "(-1) 전체취소");
        } while (["-1", "1", "2"].indexOf(input) == -1);
        
        if (input == "-1") node = null;
        else if (input == "1") node = create_figure_node();
        else if (input == "2") node = create_gui_node();

        if (node == null) return null;
        else {
            console.log(node.toString());
            return node;
        }
    }

    add_node(node, parent) {
        if (this.tree == null) { 
            alert("Tree가 생성되지 않았습니다. create_tree(NODE)를 호출해 주세요.");
            return null;
        }
        this.tree.add_node(parent, node);
        return this.tree;
    }

    delete_node(node) {
        if (this.tree == null) { 
            alert("Tree가 생성되지 않았습니다. create_tree(NODE)를 호출해 주세요.");
            return null;
        }
        this.tree.delete_node(node);
        return this.tree;
    }

    search_node(node_func) {
        if (this.tree == null) { 
            alert("Tree가 생성되지 않았습니다. create_tree(NODE)를 호출해 주세요.");
            return null;
        }
        return this.tree.search_node(node_func);
    }

    search_node_all(node_func) {
        if (this.tree == null) { 
            alert("Tree가 생성되지 않았습니다. create_tree(NODE)를 호출해 주세요.");
            return null;
        }
        return this.tree.search_node_all(node_func);
    }

    make_simple_example() { make_simple_example(); }

    make_complex_example() { 
        this.clear_tree();

        // 전체 메인 윈도우
        let window = new Window("HCI HW2-1 예시 MainWindow", 1000, 500);
        window.closeButton.shape = Shape.CIRCLE;

        // 설문조사 폼 헤더
        let headerBox = new Label(window.width, 50, "설문조사지", window.contentBox);
        headerBox.bgColor = ColorEnum.GREEN;
        headerBox.textColor = ColorEnum.RED;
        headerBox.textSize = 15;

        // 설문조사 폼 길이 상수들
        const LineWidth = 1000;
        const LineHeight = 40;
        const LeftWidth = 100;
        const RightWidth = 900;
        const IndentHeight = 30;

        // 설문조사 폼 - 이름 필드
        let namebox = new WrapperBox(LineWidth, LineHeight, window.contentBox)
        let namelbl = new Label(LeftWidth, LineHeight, "이름", namebox);
        let nametxt = new TextBox(RightWidth, LineHeight, "홍길동", namebox);
        namebox.pos = headerBox.downPos.move(0, IndentHeight);
        nametxt.pos = namelbl.rightPos;

        // 설문조사 폼 - 성별 필드
        let genderlbl = new Label(LeftWidth, LineHeight, "성별", window.contentBox);
        let genderGroup = new ButtonGroup("Gender", RightWidth, LineHeight, window.contentBox);
        genderlbl.pos = namelbl.downPos.move(0, IndentHeight);
        genderGroup.pos = genderlbl.rightPos;
        genderGroup.isExclusive = true;

        // 설문조사 폼 - 성별 필드 - 서브그룹 (라벨, 라디오버튼)
        let malelbl = new Label(50, LineHeight, "남성", genderGroup);
        let maleButton = new RadioButton(genderGroup);
        let femalelbl = new Label(50, LineHeight, "여성", genderGroup);
        let femaleButton = new RadioButton(genderGroup);
        maleButton.pos = malelbl.rightPos;
        femalelbl.pos = maleButton.rightPos;
        femaleButton.pos = femalelbl.rightPos;
        genderGroup.addButton(maleButton);
        genderGroup.addButton(femaleButton);

        // 설문조사 폼  - 선호기업 필드
        let preferlbl = new Label(LeftWidth, LineHeight, "선호기업", window.contentBox);
        let preferGroup = new ButtonGroup("Preference", RightWidth, LineHeight, window.contentBox);
        preferlbl.pos = genderlbl.downPos.move(0, IndentHeight);
        preferGroup.pos = preferlbl.rightPos;
        preferGroup.isExclusive = false;

        // 설문조사 폼 - 선호기업 필드 - 서브그룹 (목록)
        const ItemList = ["Apple", "Samsung", "Kakao"];
        let currentPos = Point.origin();
        for (let item of ItemList) {
            let itemCheckBox = new CheckBox(preferGroup);
            itemCheckBox.pos = currentPos;
            let itemlbl = new Label(50, LineHeight, item, preferGroup);
            itemlbl.pos = itemCheckBox.rightPos;
            preferGroup.addButton(itemCheckBox);

            currentPos = itemlbl.rightPos;
        }

        // 설문조사 폼  - 제출 필드
        let submitButton = new Button(200, LineHeight, "제출", window.contentBox);
        let cancelButton = new Button(200, LineHeight, "취소", window.contentBox);
        submitButton.pos = preferlbl.downPos.move(100, IndentHeight);
        cancelButton.pos = submitButton.rightPos.move(200, 0);

        // tree에 등록
        this.create_tree();
        this.add_node(window, null);
        
        return "Success! If you want to see it, exec hw.print_tree().";
    }
}



function create_figure_node() {
    let input;
    do {
        input = prompt("도형 노드 타입\n" + 
                       "(1) PointNode\n" + 
                       "(2) LineNode\n" + 
                       "(3) AreaNode\n" + 
                       "(-1) 전체취소");
    } while (["-1", "1", "2", "3"].indexOf(input) == -1);

    if (input == "-1") return null;
    else if (input == "1") {    // Point Node
        return new PointNode(Point.origin());
    }
    else if (input == "2") {    // Line Node
        return new LineNode(Point.origin(), new Point(10, 10)); 
    }
    else if (input == "3") {    // Area Node
        do {
            input = prompt("AreaNode 모양\n" + 
                           "(1) NONE (테두리 없는 직사각형)\n" + 
                           "(2) RECTANGLE\n" + 
                           "(3) CIRCLE\n" + 
                           "(-1) 전체취소");
        } while (["-1", "1", "2", "3"].indexOf(input) == -1);

        let shape;
        if (input == "-1") return null;
        else if (input == "1") shape = Shape.NONE;
        else if (input == "2") shape = Shape.RECTANGLE;
        else if (input == "3") shape = Shape.CIRCLE;
        else shape = Shape.RECTANGLE;

        let areaNode = new AreaNode(100, 100);
        areaNode.shape = shape;
        return areaNode; 
    }
}


function create_gui_node() {
    let input;

    do {
        input = prompt("GUI 노드 타입\n" + 
                       "(1) WrapperBox\n" + 
                       "(2) TextBox\n" + 
                       "(3) Label\n" + 
                       "(4) Button\n" + 
                       "(5) RadioButton\n" + 
                       "(6) CheckBox\n" + 
                       "(7) ButtonGroup\n" + 
                       "(8) Window\n" + 
                       "(-1) 전체취소");
    } while (["-1", "1", "2", "3", "4", "5", "6", "7", "8"].indexOf(input) == -1);

    if (input == "-1") return null;
    else if (input == "1") return new WrapperBox(100, 100);
    else if (input == "2") return new TextBox();
    else if (input == "3") return new Label();
    else if (input == "4") return new Button();
    else if (input == "5") return new RadioButton();
    else if (input == "6") return new CheckBox();
    else if (input == "7") {
        input = prompt("버튼 그룹 이름");
        return new ButtonGroup(input, 100, 50);
    }
    else if (input == "8") return new Window("Title", 500, 500);
}


function make_simple_example() {
    hw.clear_tree(); 

    hw.create_node();   // TextBox: 2, 2
    hw.n(1).width = 1000;
    hw.n(1).height = 50;
    hw.n(1).text = "TestTitle";

    hw.create_node();   // WrapperBox: 2, 1
    hw.n(2).width = 1000; 
    hw.n(2).height = 450;

    hw.create_node();   // Button: 2, 4
    hw.n(3).width = 50; 
    hw.n(3).height = 50;
    hw.n(3).text = "X"; 
    hw.n(3).textColor = ColorEnum.RED; 
    hw.n(3).shape = Shape.CIRCLE;

    hw.create_node();   // WrapperBox: 2, 1
    hw.n(4).width = 1000; 
    hw.n(4).height = 500; 

    hw.create_tree();
    hw.add_node(hw.n(4), null);
    hw.add_node(hw.n(1), hw.n(4));
    hw.n(4).addChild(hw.n(2));
    hw.add_node(hw.n(3), hw.n(1));
    hw.n(2).pos = hw.n(1).downPos;
    hw.n(3).pos = hw.n(1).rightPos.move(-hw.n(3).width, 0);
    hw.print_tree();
}


let hw = new GUI_TEST();

export { 
    hw,
    Shape,
    ColorEnum,
    Color,
 };

