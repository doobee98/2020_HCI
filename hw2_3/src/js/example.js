import Model from './model.js'


function make_simple_example() {
    let title = new Model.TextBox(800, 50, "TextTitle");
    let content = new Model.WrapperBox(800, 450);
    content.shape = Model.Shape.RECTANGLE;
    let button = new Model.Button(50, 50, "X");
    button.text.color = Model.ColorEnum.RED;
    button.shape = Model.Shape.CIRCLE;
    let wrap = new Model.WrapperBox(800, 500);

    wrap.addChild(title);
    wrap.addChild(content);
    title.addChild(button);

    content.pos = title.downPos;
    button.pos = title.rightPos.move(-button.width, 0);

    return wrap;
}


function make_complex_example() { 
    // 설문조사 폼 길이 상수들
    const LineWidth = 800;
    const LineHeight = 40;
    const LeftWidth = 70;
    const RightWidth = 700;
    const IndentWidth = 10;
    const IndentHeight = 30;

    // 전체 메인 윈도우
    let window = new Model.Window("HCI HW2-2 예시 MainWindow", LineWidth, 500);
    window.closeButton.shape = Model.Shape.CIRCLE;

    // 설문조사 폼 헤더
    let headerBox = new Model.Label(window.width, 50, "설문조사지", window.contentBox);
    headerBox.bgColor = Model.ColorEnum.GREEN;
    headerBox.text.color = Model.ColorEnum.RED;
    headerBox.text.size = 13;
    headerBox.text.bold = true;

    // 설문조사 폼 - 이름 필드
    let namebox = new Model.WrapperBox(LineWidth-2*IndentWidth, LineHeight, window.contentBox)
    let namelbl = new Model.Label(LeftWidth, LineHeight, "이름", namebox);
    let nametxt = new Model.TextBox(RightWidth, LineHeight, "홍길동", namebox);
    namebox.pos = headerBox.downPos.move(IndentWidth, IndentHeight);
    nametxt.pos = namelbl.rightPos.move(IndentWidth, 0);

    // 설문조사 폼 - 성별 필드
    let genderlbl = new Model.Label(LeftWidth, LineHeight, "성별", window.contentBox);
    let genderGroup = new Model.ButtonGroup("Gender", RightWidth, LineHeight, window.contentBox);
    genderlbl.pos = namebox.downPos.move(0, IndentHeight);
    genderGroup.pos = genderlbl.rightPos.move(IndentWidth, 0);
    genderGroup.isExclusive = true;

    // 설문조사 폼 - 성별 필드 - 서브그룹 (라벨, 라디오버튼)
    let malelbl = new Model.Label(50, LineHeight, "남성", genderGroup);
    let maleButton = new Model.RadioButton(genderGroup);
    let femalelbl = new Model.Label(50, LineHeight, "여성", genderGroup);
    let femaleButton = new Model.RadioButton(genderGroup);
    malelbl.pos = maleButton.rightPos.move(IndentWidth, 0);
    femaleButton.pos = malelbl.rightPos.move(IndentWidth, 0);
    femalelbl.pos = femaleButton.rightPos.move(IndentWidth, 0);
    malelbl.textHorizontalAlign = Model.Align.MIDDLE;
    femalelbl.textHorizontalAlign = Model.Align.MIDDLE;
    genderGroup.addButton(maleButton);
    genderGroup.addButton(femaleButton);

    // 설문조사 폼  - 선호기업 필드
    let preferlbl = new Model.Label(LeftWidth, LineHeight, "선호기업", window.contentBox);
    let preferGroup = new Model.ButtonGroup("Preference", RightWidth, LineHeight, window.contentBox);
    preferlbl.pos = genderlbl.downPos.move(0, IndentHeight);
    preferGroup.pos = preferlbl.rightPos.move(IndentWidth, 0);
    preferGroup.isExclusive = false;

    // 설문조사 폼 - 선호기업 필드 - 서브그룹 (목록)
    const ItemList = ["Apple", "Samsung", "Kakao"];
    let currentPos = Model.Point.origin();
    for (let item of ItemList) {
        let itemCheckBox = new Model.CheckBox(preferGroup);
        itemCheckBox.pos = currentPos;
        let itemlbl = new Model.Label(50, LineHeight, item, preferGroup);
        itemlbl.pos = itemCheckBox.rightPos.move(IndentWidth, 0);
        itemlbl.textHorizontalAlign = Model.Align.MIDDLE;
        preferGroup.addButton(itemCheckBox);

        currentPos = itemlbl.rightPos.move(IndentWidth, 0);
    }

    // 설문조사 폼  - 제출 필드
    let submitButton = new Model.Button(200, LineHeight, "제출", window.contentBox);
    let cancelButton = new Model.Button(200, LineHeight, "취소", window.contentBox);
    submitButton.pos = preferlbl.downPos.move(100, IndentHeight);
    cancelButton.pos = submitButton.rightPos.move(200, 0);

    return window;
}

export { make_simple_example, make_complex_example };
