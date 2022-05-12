"use strict";
const width = 500;
const height = 500;
const origin = [width / 2, height / 2];
const offset = (f, x, y, ...more) => f(origin[0] + x, origin[1] - y, ...more);
const L = Math.sqrt(width * width + height * height);
const root = document.getElementById("root");

const x_in_id = "x_in";
const y_in_id = "y_in";
const theta_in_id = "theta_in";
const x_in_init = 100;
const y_in_init = 50;
const t_in_init = (1.3 * Math.PI) / 4;
const x_min = -width / 2;
const y_min = -height / 2;
const theta_min = 0;
const x_max = width / 2;
const y_max = height / 2;
const theta_max = 2 * Math.PI;
const theta_step = 0.05;

const int_div = (n, d) => Math.trunc(n / d);
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

function create_label(str, for_id) {
    const l = document.createElement("label");
    l.innerText = str;
    l.setAttribute("for", for_id);
    root.appendChild(l);
    return l;
}

function create_text(id,str){
    const t = document.createElement("p");
    t.id = id;
    t.innerText = str;
    root.appendChild(t);
    return t;
}

function new_line() {
    root.appendChild(document.createElement("div"));
}

function create_input(id, min, max, step) {
    const input_box = document.createElement("input");
    input_box.type = "number";
    input_box.id = id;
    input_box.min = min;
    input_box.max = max;
    input_box.step = step;
    input_box.value = 0;
    root.appendChild(input_box);
    return input_box;
}

function create_canvas(id) {
    const new_canvas = document.createElement("canvas");
    new_canvas.id = id;

    new_canvas.width = width;
    new_canvas.height = height;
    new_canvas.style = "border:1px solid"
    root.appendChild(new_canvas);
    return new_canvas;
}

function draw(x_input, y_input, theta_input, ctx, output) {
    ctx.clearRect(0, 0, width, height);

    const reject = (n, v) => {
        if (!v) {
            console.log(n, "is not acceptable");
            return true;
        }
        return false;
    }

    const maybe_x = x_input.value;
    if (reject("x", maybe_x)) return;
    const maybe_y = y_input.value;
    if (reject("y", maybe_y)) return;
    const maybe_t = theta_input.value;
    if (reject("theta", maybe_t)) return;

    const x = Math.round(clamp(maybe_x, x_min, x_max));
    const y = Math.round(clamp(maybe_y, y_min, y_max));
    const theta = clamp(maybe_t, theta_min, theta_max);
    console.log(x, y, theta);

    // draw axis
    ctx.lineWidth = 0.3;
    ctx.beginPath();
    offset((...a) => ctx.moveTo(...a), x_min, 0);
    offset((...a) => ctx.lineTo(...a), x_max, 0);
    ctx.stroke();
    ctx.beginPath();
    offset((...a) => ctx.moveTo(...a), 0, y_min);
    offset((...a) => ctx.lineTo(...a), 0, y_max);
    ctx.stroke();

    ctx.lineWidth = 1;
    // draw point
    ctx.beginPath();
    offset((...a) => ctx.ellipse(...a), x, y, 5, 5, 0, 0, 2 * Math.PI);
    ctx.stroke();

    // draw line
    const line_offset = [L * Math.cos(theta), L * Math.sin(theta)];
    ctx.beginPath();
    offset((...a) => ctx.moveTo(...a), x - line_offset[0], y - line_offset[1]);
    offset((...a) => ctx.lineTo(...a), x + line_offset[0], y + line_offset[1]);
    ctx.stroke();

    // draw x-axis
    ctx.beginPath();
    offset((...a) => ctx.moveTo(...a), x, y);
    offset((...a) => ctx.lineTo(...a), x + 30, y);
    ctx.stroke();
    ctx.beginPath();
    offset((...a) => ctx.ellipse(...a), x, y, 25, 25, 0, 2 * Math.PI - theta, 2 * Math.PI);
    ctx.stroke();

    // draw shortest distance
    const r = y * Math.cos(theta) - x * Math.sin(theta);
    const r_abs = Math.abs(r);
    console.log("r:", r_abs);
    ctx.beginPath();
    offset((...a) => ctx.ellipse(...a), 0, 0, r_abs, r_abs, 0, 0, 2 * Math.PI);
    ctx.stroke();


    const short = [r * -Math.sin(theta), r * Math.cos(theta)];
    ctx.beginPath();
    offset((...a) => ctx.moveTo(...a), 0, 0);
    offset((...a) => ctx.lineTo(...a), short[0], short[1]);
    ctx.stroke();

    let out_str = "r' = " + y + "*sin(" + theta.toFixed(2) + ")";
    out_str += " - " + x + "*sin(" + theta.toFixed(2) + ")";
    out_str += " = " + r.toFixed(2);
    out_str += "\n\nr = |r'| = " + r_abs.toFixed(2);
    out_str += "\n\nintercept = [r' * -sin(θ), r' *cos(θ)]";
    out_str += "\n\nintercept = ["+short[0].toFixed(2) + ", "
    out_str += short[1].toFixed(2)+"]";
    output(out_str);
}


function main() {
    // create elements
    create_label("x: ", x_in_id);
    const x_in = create_input(x_in_id, x_min, x_max, 1);
    new_line();

    create_label("y: ", y_in_id)
    const y_in = create_input(y_in_id, y_min, y_max, 1);
    new_line();

    create_label("θ: ", theta_in_id)
    const theta_in = create_input(theta_in_id, theta_min, theta_max, theta_step);

    create_text("description", "The distance, r, from the origin to a line running through a point at angle θ is given by:");
    create_text("formula", "r = |y*sin(θ) - x*cos(θ)|");
    const result = create_text("result", "");
    new_line();

    const ctx = create_canvas("my_canvas", false).getContext("2d");

    // setup inputs
    const run = () => draw(x_in, y_in, theta_in, ctx, (str) => {result.innerText = str;});
    x_in.oninput = y_in.oninput = theta_in.oninput = run;

    x_in.value = x_in_init;
    y_in.value = y_in_init;
    theta_in.value = t_in_init;

    // get started
    run();
}

main();