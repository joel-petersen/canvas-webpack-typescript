'use strict';

import Shape from './shape';
import Point from './point';

class Circle extends Shape {
    public type = 'circle';
    private endPoint: Point;

    constructor(x: number, y: number, color: string, public lineWidth: number, x1: number, y1: number) {
        super(x, y, color);
        this.endPoint = new Point(x1, y1);
    }

    setSize(x: number, y: number): void {
        this.endPoint.x = x;
        this.endPoint.y = y;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        let x0 = this.position.x,
            y0 = this.position.y,
            x1 = this.endPoint.x,
            y1 = this.endPoint.y;

        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = this.color;

        ctx.beginPath();

        ctx.moveTo(x0, y0 + (y1 - y0) / 2);
        ctx.bezierCurveTo(x0, y0, x1, y0, x1, y0 + (y1 - y0) / 2);
        ctx.bezierCurveTo(x1, y1, x0, y1, x0, y0 + (y1 - y0) / 2);

        ctx.stroke();
        ctx.closePath();
    }
}

export default Circle;
