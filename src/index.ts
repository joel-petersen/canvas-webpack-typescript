import * as $ from 'jquery';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min';
import 'spectrum-colorpicker/spectrum.css';
import 'spectrum-colorpicker';
import './styles.scss';

import ResizeCanvas from './utils/resizer';
import Server from './utils/server';
import Canvas from './utils/canvas';
import Pencil from './models/pencil';
import Line from './models/line';
import Rectangle from './models/rectangle';
import Circle from './models/circle';
import Text from './models/text';

let server: Server;

$(document).ready(() => {
    // Resize the whiteboard to match width and height of window
    ResizeCanvas();
    $(window).resize(ResizeCanvas);

    const canvasElement = document.getElementById('myCanvas') as HTMLCanvasElement;
    const canvas: Canvas = new Canvas(canvasElement);

    server = new Server(canvas, $('#savedDrawingData'));
    server.getSavedList();

    const colorPicker = $('#penColor') as any;
    colorPicker.spectrum({
        preferredFormat: 'hex'
    });

    $('#penShape').change((ev: JQueryMouseEventObject): void => {
        canvas.penShape = ev.target['value'];
    });

    $('#penSize').change((ev: JQueryMouseEventObject): void => {
        canvas.penSize = ev.target['value'];
    });

    $('#penColor').change((ev: JQueryMouseEventObject): void => {
        canvas.penColor = ev.target['value'];
    });

    $('#clearCanvas').click((): void => canvas.clearCanvas());
    $('#undo').click((): void => canvas.redoShape());
    $('#redo').click((): void => canvas.undoShape());

    $('#myCanvas').mousedown((ev: JQueryMouseEventObject): void => {
        const x0 = ev.pageX - ev.target['offsetLeft'];
        const y0 = ev.pageY - ev.target['offsetTop'];
        canvas.addShape(x0, y0, ev);
    });

    $('#myCanvas').mousemove((ev: JQueryMouseEventObject): void => {
        if (canvas.isDrawing) {
            const x0 = ev.pageX - ev.target['offsetLeft'];
            const y0 = ev.pageY - ev.target['offsetTop'];
            const width = x0 - canvas.currentShape.position.x;
            const height = y0 - canvas.currentShape.position.y;
            let currShape;

            // TODO: Find a way to remove the casting step

            switch (canvas.penShape) {
                case 'pencil':
                    currShape = canvas.currentShape as Pencil;
                    currShape.addPoint(x0, y0);
                    break;
                case 'line':
                    currShape = canvas.currentShape as Line;
                    currShape.setEndPoint(x0, y0);
                    break;
                case 'rectangle':
                    currShape = canvas.currentShape as Rectangle;
                    currShape.setSize(width, height);
                    break;
                case 'circle':
                    currShape = canvas.currentShape as Circle;
                    currShape.setSize(x0, y0);
                    break;
                case 'eraser':
                    currShape = canvas.currentShape as Pencil;
                    currShape.addPoint(x0, y0);
                    break;
            }

            // Draw shape while mouse is moving
            canvas.redraw();
            canvas.currentShape.draw(canvas.ctx);
        }
    });

    $('#myCanvas').mouseup((): void => {
        if (canvas.penShape !== 'text') {
            canvas.shapes.push(canvas.currentShape);
            canvas.redraw();
        }

        canvas.isDrawing = false;
    });

    $('.text-spawner').keydown((ev: JQueryMouseEventObject): void => {
        if (canvas.isDrawing) {
            if (ev.which === 13) {
                let currShape = canvas.currentShape as Text;
                currShape.setText = canvas.currentInputBox.val();

                canvas.shapes.push(canvas.currentShape);
                canvas.currentShape.draw(canvas.ctx);

                canvas.isDrawing = false;
                canvas.currentInputBox.remove();
            } else if (ev.which === 27) {
                canvas.isDrawing = false;
                canvas.currentInputBox.remove();
            }
        }
    });

    $('#save').click((): void => {
        if (canvas.shapes.length > 0) {
            const name = prompt('Save drawing as:', '');

            if (name) {
                server.saveCanvas(name);
            } else {
                alert('You have to pick a name for this piece of art.');
            }
        } else {
            alert('Nothing to do here..');
        }
    });
});

// To handle clicks in the loaded drawing list
$(document).on('click', '.loadCanvas', function () {
    const id = $(this).val();
    server.getSaved(id);
});
