
class Point {
    static origin() { return new Point(0, 0); }
    
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    move(x, y) { return new Point(this.x + x, this.y + y); }
    add(otherPos) { return new Point(this.x + otherPos.x, this.y + otherPos.y); }
    sub(otherPos) { return new Point(this.x - otherPos.x, this.y - otherPos.y); }
    neg() { return new Point(-this.x, -this.y); }
    mid(otherPos) { 
        let tempPos = this.add(otherPos);
        return new Point(parseInt(tempPos.x / 2), parseInt(tempPos.y / 2));
    }
    
    distance(other) {
        return (Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2)));
    }

    toString() {
        return `(${this.x}, ${this.y})`;
    }
}

export default Point;
