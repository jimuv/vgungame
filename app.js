const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;
const radius = 20;
let keys = {};
let mouseX=0;
let mouseY=0;
let mouseDown=false;
let justClicked = false;

let balls =[
    { x: canvas.width / 2, y: canvas.height / 2, dx: 0, dy: 0 ,color: "blue",radius: radius,isPlayer: true }
]
window.addEventListener("keydown", (event)=>{
    keys[event.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (event)=>{
    keys[event.key.toLowerCase()] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
});

canvas.addEventListener('mousedown', () => {
    mouseDown = true;
    justClicked = true;
});

canvas.addEventListener('mouseup', () => {
    mouseDown = false;
});


class Button {
    constructor(x, y, width, height, text,color,transparency) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.color=color;
        this.transparency=transparency;
    }
    update() {
        if (mouseDown && mouseX >= this.x && mouseX <= this.x + this.width && mouseY >= this.y && mouseY <= this.y + this.height) {
            return true;
        }
        return false;
    }
    draw(ctx) {
        ctx.globalAlpha = this.transparency;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'black';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = this.transparency;
        ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);
    }
    isPressed() {
        return justClicked&& mouseX >= this.x && mouseX <= this.x + this.width && mouseY >= this.y && mouseY <= this.y + this.height;
    }
}

class Frame {
    constructor(x, y, width, height, color,transparency,ball) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.visible = false;
        this.buttons = [];
        this.transparency=transparency;
        this.dragging=false;
        this.dragOffsetX=0;
        this.dragOffsetY=0;
        this.titleBarHeight=30;

        this.ball=ball;
    }
    draw(ctx) {
        if (this.visible) {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.transparency;
            ctx.fillRect(this.x, this.y, this.width, this.height);

            ctx.fillStyle = 'black';
            ctx.fillRect(this.x, this.y, this.width, this.titleBarHeight);
            ctx.fillStyle = 'white';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Frame', this.x + this.width / 2, this.y + this.titleBarHeight / 2);
            for (const button of this.buttons) {
                button.draw(ctx);
            }
        }
    }
    
update() {
    if (!this.visible) {
        this.dragging = false;
        return;
    }

    if (
        justClicked &&
        mouseX >= this.x &&
        mouseX <= this.x + this.width &&
        mouseY >= this.y &&
        mouseY <= this.y + this.titleBarHeight
    ) {
        this.dragging = true;
        this.dragOffsetX = mouseX - this.x;
        this.dragOffsetY = mouseY - this.y;
    }

    if (!mouseDown) {
        this.dragging = false;
    }

    if (this.dragging && mouseDown) {
        const newX = mouseX - this.dragOffsetX;
        const newY = mouseY - this.dragOffsetY;

        const moveX = newX - this.x;
        const moveY = newY - this.y;

        this.x = newX;
        this.y = newY;

        for (const button of this.buttons) {
            button.x += moveX;
            button.y += moveY;
        }
    }


    for (const button of this.buttons) {
        button.update();
    }
}

    addButton(button) {
        this.buttons.push(button);
    }
}

const menubutton = new Button(
    100, 300, 50, 50, "Menu", "lightgreen", 1
);

const menu = new Frame(
    250, 250, 300, 250, "lightgray", 0.5, null
);

const button = new Button(
    300, 300, 150, 50, "Move Ball", "darkgray", 0.5
);

const button2 = new Button(
    300, 350, 150, 50, "Stop Ball", "darkgray", 0.5
);

const button3 = new Button(
    300, 400, 150, 50, "Add Moving Ball", "darkblue", 0.5
);

menu.addButton(button);
menu.addButton(button2);
menu.addButton(button3);

let ballFrames = [];

function animate(){
    
    ctx.clearRect(0,0,canvas.width, canvas.height);
    
    menu.update();
    menu.draw(ctx);
    menubutton.update();
    menubutton.draw(ctx);

    
for (const ball of balls) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    if (ball === balls[0]) {
        if (keys['w']) ball.y -= 2;
        if (keys['s']) ball.y += 2;
        if (keys['a']) ball.x -= 2;
        if (keys['d']) ball.x += 2;
    }

    ball.x += ball.dx;
    ball.y += ball.dy;

    
    if (ball.x + ball.radius > canvas.width) {
    ball.x = canvas.width - ball.radius;
    ball.dx = -Math.abs(ball.dx);
} else if (ball.x - ball.radius < 0) {
    ball.x = ball.radius;
    ball.dx = Math.abs(ball.dx);
}

if (ball.y + ball.radius > canvas.height) {
    ball.y = canvas.height - ball.radius;
    ball.dy = -Math.abs(ball.dy);
} else if (ball.y - ball.radius < 0) {
    ball.y = ball.radius;
    ball.dy = Math.abs(ball.dy);
}

    
    
}





for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
        const ball1 = balls[i];
        const ball2 = balls[j];

        const dx = ball2.x - ball1.x;
        const dy = ball2.y - ball1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

       
        if (distance === 0) {
            ball2.x += ball1.radius + ball2.radius;
            continue;
        }

        
        if (distance < ball1.radius + ball2.radius) {
            const nx = dx / distance;
            const ny = dy / distance;

            const relativeVelocityX = ball2.dx - ball1.dx;
            const relativeVelocityY = ball2.dy - ball1.dy;

            const velocityAlongNormal =
                relativeVelocityX * nx +
                relativeVelocityY * ny;

            
            if (velocityAlongNormal < 0) {
            if (!ball1.isPlayer) {
                ball1.dx += velocityAlongNormal * nx;
                ball1.dy += velocityAlongNormal * ny;
            }

            if (!ball2.isPlayer) {
                ball2.dx -= velocityAlongNormal * nx;
                ball2.dy -= velocityAlongNormal * ny;
            }
        }

            const overlap =
                ball1.radius + ball2.radius - distance;

            ball1.x -= nx * overlap / 2;
            ball1.y -= ny * overlap / 2;
            ball2.x += nx * overlap / 2;
            ball2.y += ny * overlap / 2;
        }
    }
}


      
    
if (menubutton.isPressed()) {
    menu.visible = !menu.visible;
}

if (menu.visible) {
    if (button.isPressed()) {
        for (const ball of balls) {
            ball.dx = 2;
            ball.dy = 2;
        }
    }

    if (button2.isPressed()) {
        for (const ball of balls) {
            ball.dx = 0;
            ball.dy = 0;
        }
    }

    if (button3.isPressed()) {
        const newBall = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            dx: 0,
            dy: 0,
            color:"red",
            radius: radius
        };

        balls.push(newBall);

        const newFrame = new Frame(
            350, 100, 200, 120, "lightgray", 0.5, newBall
        );
        newFrame.visible = true;

        const moveButton = new Button(
            newFrame.x + 25, newFrame.y + 40,
            150, 30, "Move Ball", "darkgray", .5
        );

        const stopButton = new Button(
            newFrame.x + 25, newFrame.y + 75,
            150, 30, "Stop Ball", "darkgray", .5
        );

        newFrame.addButton(moveButton);
        newFrame.addButton(stopButton);
        ballFrames.push(newFrame);
    }
}

for (const frame of ballFrames) {
    frame.update();

    if (frame.buttons[0].isPressed()) {
        frame.ball.dx = 2;
        frame.ball.dy = 2;
    }

    if (frame.buttons[1].isPressed()) {
        frame.ball.dx = 0;
        frame.ball.dy = 0;
    }

    frame.draw(ctx);
}

    justClicked=false;
    requestAnimationFrame(animate);
}
animate();