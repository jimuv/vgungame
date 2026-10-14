const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;
const radius = 20;
let keys = {};
let fWasPressed = false;
let mouseX=0;
let mouseY=0;
let mouseDown=false;
let justClicked = false;
let isDarkMode = false;
let bgCooldown = false;
const BG_COOLDOWN_MS = 1000;
// Placeholders
let enemyCountMax=10;
let enemyCounter=0;
let money=0;
let skins = ["red", "blue", "green", "yellow", "purple"];
let enemyVariants=["red"]
let wave = 1;
let waveEnemies = [5, 10, 15, 20, 25];
let rewards = [10, 20, 30, 40, 50];

let accessories = ["Top Hat", "Glasses", "Monocle", "Crown"];
let Owned = [];

const accessoryImages = {
    "Glasses": new Image(),
    "Top Hat": new Image(),
    "Monocle": new Image(),
    "Crown": new Image()
}
accessoryImages["Glasses"].src = "assets/glasses.png";
accessoryImages["Top Hat"].src = "assets/Top_Hat.png";
accessoryImages["Monocle"].src = "assets/monocle.png";
accessoryImages["Crown"].src = "assets/Crown.png";

const weaponImages= {
    "Pistol": new Image(),
    "Shotgun": new Image(),
    "Sniper": new Image(),
}
weaponImages["Pistol"].src = "assets/Pistol.png";
weaponImages["Shotgun"].src = "assets/Shotgun.png";
weaponImages["Sniper"].src = "assets/glasses.png";
let armor = ["Leather", "Chain", "Plate"];
let stats = {
    speed: 1,
    health: 100,
    damage: 10,
    fireRate: 1,
    armor: 0
}
let currentCategory = "Guns";
/*
plans:
guns: rocket launcher???
add powerups: health, speed, damage, armor
*/

let balls =[
    { x: canvas.width / 2, y: canvas.height / 2, dx: 0, dy: 0 ,color: "blue",radius: radius,isPlayer: true, health: getMaxHealth(), maxHealth: getMaxHealth(),hit: false, isDead: false, weapon: null, remove: false, ammo: Infinity, isProjectile: false, createdAt: null, following: false}
]
let objects = [];

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

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    
    mouseDown = true;
    justClicked = true;

    clickedFrame=getTopFrameAtMouse();
    if(clickedFrame){
        bringFrameToFront(clickedFrame);
    }
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
    constructor(x, y, width, height, color,transparency,ball,hasTitleBar=false) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.visible = false;
        this.buttons = [];
        this.texts = [];
        this.transparency=transparency;
        this.dragging=false;
        this.dragOffsetX=0;
        this.dragOffsetY=0;
        this.titleBarHeight=30;
        this.hasTitleBar=hasTitleBar;

        this.ball=ball;
        this.exitButton = hasTitleBar ? new Button(
        this.x + this.width - 30,
        this.y + 5,
        25, 20, "X", "red", 0.75
        ) : null;
    }
    addText(text) {
    this.texts.push(text);
    }   
    
    draw(ctx) {
        if (this.visible) {
            
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.transparency;
            ctx.fillRect(this.x, this.y, this.width, this.height);

            ctx.fillStyle = 'black';
            if (this.hasTitleBar) {
                ctx.fillRect(this.x, this.y, this.width, this.titleBarHeight);
            }
            if (this.hasTitleBar) {
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillText(
        'Frame',
        this.x + this.width / 2,
        this.y + this.titleBarHeight / 2
    );
    }

    if (this.exitButton) {
        this.exitButton.draw(ctx);
    }
                

            for (const button of this.buttons) {
                button.draw(ctx);
            }
            for (const text of this.texts) {
            text.draw(ctx);
            }
        }
    }
    
update() {
    if (!this.visible) {
        this.dragging = false;
        return;
    }

    if (
        this === clickedFrame &&
        this.hasTitleBar &&
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

        if (this.exitButton) {
            this.exitButton.x += moveX;
            this.exitButton.y += moveY;
        }
        for (const button of this.buttons) {
            button.x += moveX;
            button.y += moveY;
        }
        for (const text of this.texts) {
        text.x += moveX;
        text.y += moveY;
     }   
        
    if (this === shopmenu) {
        for (const entry of itemButtons) {
            entry.button.x += moveX;
            entry.button.y += moveY;
        }
    }

    }


    for (const button of this.buttons) {
        button.update();
    }
    if (this.exitButton) {
        this.exitButton.update();

        if (this === clickedFrame && this.exitButton.isPressed()) {
            this.visible = false;
            this.dragging = false;

            if (this.ball && this.ball.isEnemy) {
                this.ball.remove = true;
                clearTimeout(this.ball.randomMovementTimer);
                this.ball.randomMovementTimer = null;
                }
        }
        }
    }   
        addButton(button) {
        this.buttons.push(button);
    }
}
class Object {
    constructor(type) {
        if (type === "heal") {
            this.x = Math.random() * (canvas.width - 20) + 10;
            this.y = Math.random() * (canvas.height - 20) + 10;
            this.width = 20;
            this.height = 20;
            this.radius = 10;
            this.color = "green";
            this.type = "heal";
            this.healAmount = 25;

            this.scale=3;
            this.startTime=performance.now();
            this.duration=1000;
        }
        if (type === "rock") {
            this.x = Math.random() * (canvas.width - 20) + 10;
            this.y = Math.random() * (canvas.height - 20) + 10;
            this.width = 20;
            this.height = 20;
            this.radius = 10;
            this.color = "gray";
            this.type = "rock";
            this.healAmount = -25;

            this.scale=3;
            this.startTime=performance.now();
            this.duration=1000;
        }
    }
    update(){
        const elapsed = performance.now() - this.startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        this.scale= 3-eased*2;
        
        
        let r, g, b;

        if (this.type === "heal") {
            r = 0;
            g = 128;
            b = 0;
        } else if (this.type === "rock") {
            r = 128;
            g = 128;
            b = 128;
        }

        this.color = `rgb(
            ${Math.round(r * eased)},
            ${Math.round(g * eased)},
            ${Math.round(b * eased)}
        )`;
    }
     draw(ctx) {
        this.update();
        const width = this.width * this.scale;
        const height = this.height * this.scale;
        const x = this.x + (this.width - width) / 2;
        const y = this.y + (this.height - height) / 2;

        
        ctx.fillStyle = this.color;
        ctx.fillRect(x, y, width, height);
    }
}
class Gun {
    constructor(name, damage, fireRate, ammo, projectileSpeed = 5, bulletCount = 1, spread = 0) {
        this.name = name;
        this.damage = damage;
        this.fireRate = fireRate;
        this.ammo = ammo;
        this.projectileSpeed = projectileSpeed;
        this.bulletCount = bulletCount;
        this.spread = spread;
        this.offsetX = 0;
        this.offsetY = 0;  
        if (this.name==="Pistol"||this.name===null){
            this.x=0;
            this.y=0;
            this.width=20;
            this.height=5;
            this.angle=0;
            this.lastShot=0;
            this.offsetX=10;
            this.offsetY=0;
        }
        if(this.name==="Shotgun"){
            this.x=0;
            this.y=-10;
            this.width=60;
            this.height=10+20;
            this.angle=0;
            this.lastShot=0;
            this.offsetX=10;
            this.offsetY=0;
        }
        if(this.name==="Sniper"){
            this.x=0;
            this.y=-25;
            this.width=90;
            this.height=7;
            this.angle=0;
            this.lastShot=0;
            this.offsetX=0;
            this.offsetY=-10;
        }
        if(this.name==="Dual Wield"){
            this.x = 0;
            this.y = 0;
            this.width = 20;
            this.height = 5;
            this.angle = 0;
            this.lastShot = 0;
            this.offsetX=0;
            this.offsetY=0;
        }
    }
    translate(dx, dy) {
        this.angle=Math.atan2(dy, dx)
    }
    canShoot(){
        return Date.now() - this.lastShot >= 1000 / this.fireRate && (this.ammo > 0 || this.ammo === Infinity);
    }
    shoot(player,targetX,targetY){
        if (!this.canShoot()) return [];

        this.lastShot = Date.now();

        if (this.ammo !== Infinity) {
            this.ammo--;
        }

        const dx= targetX - player.x;
        const dy= targetY - player.y;
        const angle=Math.atan2(dy, dx);
        const projectiles = [];

        for(let i=0;i<this.bulletCount;i++){
            const offset=this.bulletCount===1?0:(i/(this.bulletCount-1)-0.5)*this.spread;
            const projectileAngle=angle+offset;
            projectiles.push({
                x: player.x,
                y: player.y,
                dx: Math.cos(projectileAngle)*this.projectileSpeed,
                dy: Math.sin(projectileAngle)*this.projectileSpeed,
                color: "yellow",
                radius: 5,
                isProjectile: true,
                createdAt: Date.now(),
                damage: this.damage
            })
        }

        return projectiles;
    }
    
    
}


const glassesImage = new Image();
glassesImage.src = "assets/glasses.png";



const bushImage = new Image();
bushImage.src = "assets/bush.png";

const bushes = [];

const treeImage = new Image();
treeImage.src = "assets/tree.png";

const trees = [];

class Bush {
    constructor(x, y, width = 60, height = 60) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw(ctx) {
        if (bushImage.complete && bushImage.naturalWidth > 0) {
            ctx.drawImage(
                bushImage,
                this.x,
                this.y,
                this.width,
                this.height
            );
        }
    }
}

class Tree {
    constructor(x, y, width = 60, height = 120) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw(ctx) {
        if (treeImage.complete && treeImage.naturalWidth > 0) {
            ctx.drawImage(
                treeImage,
                this.x,
                this.y,
                this.width,
                this.height
            );
        }
    }
}
//test:
bushes.push(new Bush(150, 200));
bushes.push(new Bush(400, 300));
bushes.push(new Bush(600, 150));

trees.push(new Tree(500, 450));


class Text {
    constructor(x, y, text, color, size) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.size = size;
    }

    draw(ctx) {
        ctx.globalAlpha = 1;
        ctx.fillStyle = this.color;
        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(this.text, this.x, this.y);
    }
}
const weapons = {
    Pistol: new Gun("Pistol", 10, 3, Infinity),
    Shotgun: new Gun("Shotgun", 8, 1, 64, 5, 5, 0.5),
    Sniper: new Gun("Sniper", 50, 0.5, 10, 10, 1),
    DualWield: new Gun("Dual Wield", 8, 5, Infinity)
};

const shopItems = {
    Guns: [
        { name: "Pistol", action: () => currentWeapon = weapons.Pistol },
        { name: "Shotgun", action: () => currentWeapon = weapons.Shotgun },
        { name: "Sniper", action: () => currentWeapon = weapons.Sniper },
        { name: "Dual Wield", action: () => currentWeapon = weapons.DualWield }
    ],
    Utility: [
        { name: "Heal Package", action: () => objects.push(new Object("heal")) },
        { name: "Big Rock", action: () => objects.push(new Object("rock")) }
    ],
    Skins: [
        { name: "Red Ball", action: () => balls[0].color = "red" },
        { name: "Blue Ball", action: () => balls[0].color = "blue" },
        ...accessories.map(name => ({ name,price: name=== "Crown" ? 10 : 0, action: () => wearAccessory(name)}))
    ],
    Armor: [
        { name: "Leather Armor", action: () => equipArmor(5) },
        { name: "Iron Armor", action: () => equipArmor(10) },
        { name: "Gold Armor", action: () => equipArmor(15) }
    ]
};

function getMaxHealth() {
    return 100 + stats.armor * 5;
}

function wearAccessory(accessoryName) {
    const player = balls.find(ball => ball.isPlayer);
    if (!player) return;
    if(accessoryName==="Crown"&&!Owned.includes("Crown")&&money>=10){
        Owned.push("Crown");
        money-=10;
    }
    if(Owned.includes(accessoryName)){
        player.accessory= accessoryName;
    }
    if(accessoryName!=="Crown"){
    player.accessory = accessoryName;
    }

}
function getAccessory() {
    const player = balls.find(ball => ball.isPlayer);
    if (!player) return;
    const image = accessoryImages[player.accessory];

    if(!image||!image.complete||image.naturalWidth===0){
        return null;
    }
    let width = player.radius * 2;
    let height = player.radius * 2;
    let x = player.x - player.radius;
    let y = player.y - player.radius;

    if(player.accessory==="Glasses"){
        width= player.radius*2;
        height= player.radius*2;
    }
    if(player.accessory==="Top Hat"){
        y=player.y - player.radius-25;
        width= player.radius*2;
        height= player.radius*2;
    }
    if(player.accessory==="Crown"){
        y=player.y - player.radius-25;
        width= player.radius*2;
        height= player.radius*2;
    }
    if(player.accessory==="Monocle"){
        width= player.radius*2;
        height= player.radius*2;
    }
    ctx.drawImage(image, x, y, width, height);
}
function equipArmor(armorValue) {
    const player = balls.find(ball => ball.isPlayer);
    if (!player) return;

    const oldMaxHealth = player.maxHealth;

    stats.armor = armorValue;
    player.maxHealth = getMaxHealth();

    player.health = Math.min(
        player.health + (player.maxHealth - oldMaxHealth),
        player.maxHealth
    );
}



let itemButtons = [];


let currentWeapon = weapons.Pistol;

function gunDraw() {
    const player = balls.find(ball => ball.isPlayer);
    if (!player) return;
    
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(currentWeapon.angle);
    if (currentWeapon.name === "Dual Wield") {
        const image = weaponImages["Pistol"];

        if (image && image.complete && image.naturalWidth > 0) {
            ctx.drawImage(image, 0, -player.radius-19, currentWeapon.width+5, currentWeapon.height+25);
            ctx.drawImage(image, 0, 10, currentWeapon.width+5, currentWeapon.height+25);
        } else {
            ctx.fillStyle = "black";
            ctx.fillRect(0, -22, currentWeapon.width, currentWeapon.height);
            ctx.fillRect(0, 10, currentWeapon.width, currentWeapon.height);
        }
    } else {
        const image = weaponImages[currentWeapon.name];

        if (image && image.complete && image.naturalWidth > 0) {
            ctx.drawImage(
                image,
                currentWeapon.offsetX,
                currentWeapon.offsetY,
                currentWeapon.width + 5,
                currentWeapon.height + 25
            );
        }
    }
    ctx.restore();
}

const info = new Frame(
    50, 50, 150, 70, "lightblue", 0, null
);
const infotext1 = new Text(
    60, 60, "Ammo: Infinity", isDarkMode ? "#fffefe" : "#000000", 14
);
const infotext2 = new Text(
    60, 80, `Health: ${getMaxHealth()}`, isDarkMode ? "#fffefe" : "#000000", 14
);
info.addText(infotext1);
info.addText(infotext2);

const menubutton = new Button(
    100, 300, 50, 50, "Menu", "lightgreen", 1
);

const menu = new Frame(
    250, 250, 300, 250, "lightgray", 0.5, null, true
);

const settings = new Frame(
    400, 400, 300, 250, "darkgray", 0.5, null, true
);
const bgButton = new Button(
    450, 450, 150, 50, "Change Background", "lightgray", 0.5
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

const button4 = new Button(
    450, 400, 50, 50, "Skins", "lightyellow", 0.5
);

const buttonshop = new Button(
    450, 450, 50, 50, "Shop", "lightgreen", 0.5
);


const buttonshopGun = new Button(
    400, 650, 50, 50, "Guns", "purple", 0.5
);
const buttonshopUtil = new Button(
    450, 650, 50, 50, "Utility", "purple", 0.5
);
const buttonshopSkins = new Button(
    500, 650, 50, 50, "Skins", "purple", 0.5
);
const buttonshopArmor = new Button(
    550, 650, 50, 50, "Armor", "purple", 0.5
);

const button5 = new Button(
    500, 500, 50, 50, "red ball", "red", 0.5
);
const button6 = new Button(
    550, 500, 50, 50, "blue ball", "blue", 0.5
);
const button7 = new Button(
    500, 550, 50, 50, "green ball", "green", 0.5
);
const button8 = new Button(
    550, 550, 50, 50, "yellow ball", "yellow", 0.5
);
const buttonSettings = new Button(
    450, 350, 50, 50, "Settings", "lightgray", 0.5
);

const skinsmenu = new Frame(
    400, 400, 300, 250, "lightorange", 0.5, null, true

);

const shopmenu = new Frame(
    400, 400, 300, 250, "lightgreen", 0.5, null, true

);
menu.addButton(button);
menu.addButton(button2);
menu.addButton(button3);
menu.addButton(button4);
menu.addButton(buttonshop);
menu.addButton(buttonSettings);
skinsmenu.addButton(button5);
skinsmenu.addButton(button6);
skinsmenu.addButton(button7);
skinsmenu.addButton(button8);

settings.addButton(bgButton);

shopmenu.addButton(buttonshopGun);
shopmenu.addButton(buttonshopUtil);
shopmenu.addButton(buttonshopSkins);
shopmenu.addButton(buttonshopArmor);

function showCategory(category) {
    currentCategory = category;
    itemButtons = shopItems[category].map((item, index) => ({
        item,
        button: new Button(
            shopmenu.x + 10 + (index % 2) * 100,
            shopmenu.y + 80 + Math.floor(index / 2) * 45,
            90, 35,
            `${item.name} $${item.price ?? 0}`,
            "lightgray",
            1
        )
    }));
}
showCategory(currentCategory);



let ballFrames = [];
let frameOrder = [menu, skinsmenu, shopmenu, settings];
let clickedFrame = null;

function isInsideFrame(frame, x, y) {
    return frame.visible &&
        x >= frame.x &&
        x <= frame.x + frame.width &&
        y >= frame.y &&
        y <= frame.y + frame.height;
}

function getTopFrameAtMouse() {
    for (let i = frameOrder.length - 1; i >= 0; i--) {
        if (isInsideFrame(frameOrder[i], mouseX, mouseY)) {
            return frameOrder[i];
        }
    }
    return null;
}

function bringFrameToFront(frame) {
    const index = frameOrder.indexOf(frame);

    if (index !== -1) {
        frameOrder.splice(index, 1);
        frameOrder.push(frame);
    }
}

function drawFrame(frame) {
    frame.update();
    frame.draw(ctx);

    if (frame === shopmenu && shopmenu.visible) {
        for (const entry of itemButtons) {
            entry.button.draw(ctx);
        }
    }
}

function animate(){
    
    ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.fillStyle = isDarkMode ? "#2b2828" : "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = isDarkMode ? "#fffefe" : "#000000";
    ctx.font = "16px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    ctx.fillText(`Money: ${money}`, 10, 10);
    // ctx.fillText(`Wave: ${wave}`, 10, 30);
    // ctx.fillText(`Enemies: ${enemyCounter}/${enemyCountMax}`, 10, 50);
    menubutton.draw(ctx);

    
    bushes.forEach(bush => bush.draw(ctx));
    trees.forEach(tree => tree.draw(ctx));
    
for (const ball of balls) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.globalAlpha = ball.isDead ? 0.25 : 1;
    ctx.fill();
    ctx.globalAlpha = 1;
    if (ball === balls[0]) {
        if (keys['w']) ball.y -= 2;
        if (keys['s']) ball.y += 2;
        if (keys['a']) ball.x -= 2;
        if (keys['d']) ball.x += 2;
    }

    ball.x += ball.dx;
    ball.y += ball.dy;
    const player = balls.find(b => b.isPlayer);
    if (ball.following===true&&ball.isEnemy&&!ball.isDead&&!player.isDead&&player.isDead===false){
                startFollowing(ball);
            }
    
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

        if (ball1.isProjectile || ball2.isProjectile) {
    let projectile;
    let enemy;

    if (ball1.isProjectile && !ball2.isProjectile && !ball2.isPlayer) {
        projectile = ball1;
        enemy = ball2;
    } else if (ball2.isProjectile && !ball1.isProjectile && !ball1.isPlayer) {
        projectile = ball2;
        enemy = ball1;
    }

    if (projectile && enemy) {
        const dx = enemy.x - projectile.x;
        const dy = enemy.y - projectile.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < projectile.radius + enemy.radius && !enemy.hit && !enemy.isDead) {
            enemy.hit = true;
            enemy.color = "lightcoral";
            enemy.health -= projectile.damage;
            if (enemy.health <= 0) {
                enemy.isDead = true;
                enemy.transparency=0.95;
                enemy.dx = projectile.dx/15;
                enemy.dy = projectile.dy/15;
                
                setTimeout(() => {
                enemy.remove = true;
                money += 10;
            }, 800);
            }
            projectile.remove = true;

            setTimeout(() => {
                enemy.color = "red";
                enemy.hit = false;
            }, 200);
        }
    }

    continue;
}

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

            if (ball1.isDead || ball2.isDead) {
                    continue;
                }
            if (velocityAlongNormal < 0) {
            if (!ball1.isPlayer&&!ball1.isDead) {
                ball1.dx += velocityAlongNormal * nx;
                ball1.dy += velocityAlongNormal * ny;
            }

            if (!ball2.isPlayer&&!ball2.isDead) {
                ball2.dx -= velocityAlongNormal * nx;
                ball2.dy -= velocityAlongNormal * ny;
            }
            
        }

            const overlap =
                ball1.radius + ball2.radius - distance;
            if(ball1.isPlayer&&ball2.isEnemy&&ball1.hit==false){
                ball1.hit=true;
                ball1.health -= 10;
                ball1.color = "lightblue";
                setTimeout(() => {
                    ball1.color = "blue";
                    ball1.hit = false;
                }, 200);
                if(ball1.health <= 0){
                    ball1.isDead = true;
                    ball1.transparency=0.95;
                    setTimeout(() => {
                        ball1.isDead=false;
                        ball1.health = ball1.maxHealth;
                        ball1.x = canvas.width / 2;
                        ball1.y = canvas.height / 2;
                    }, 2000);
                }
            }
            ball1.x -= nx * overlap / 2;
            ball1.y -= ny * overlap / 2;
            ball2.x += nx * overlap / 2;
            ball2.y += ny * overlap / 2;
        }
    }
    
}


      
    const player = balls.find(ball => ball.isPlayer);
    if (player) {
        for (const obj of objects) {
            if (obj.type === "heal"||obj.type === "rock") {
                obj.draw(ctx);
                const closestX = Math.max(
            obj.x,
            Math.min(player.x, obj.x + obj.width)
        );

        const closestY = Math.max(
            obj.y,
            Math.min(player.y, obj.y + obj.height)
        );

        const dx = player.x - closestX;
        const dy = player.y - closestY;

        if (dx * dx + dy * dy < player.radius * player.radius &&!player.isDead) {
            player.health = Math.max(
                0,
                Math.min(player.health + obj.healAmount, player.maxHealth)
            );
            

            obj.remove = true;
            if (player.health <= 0 && !player.isDead) {
                player.isDead = true;
                player.transparency = 0.95;

                setTimeout(() => {
                    player.isDead = false;
                    player.health = player.maxHealth;
                    player.x = canvas.width / 2;
                    player.y = canvas.height / 2;
                    player.dx = 0;
                    player.dy = 0;
                }, 2000);
            }
        }
                
            }
        }
        objects = objects.filter(obj => !obj.remove);
    }
if (!clickedFrame && menubutton.isPressed()) {
    menu.visible = !menu.visible;
}

if (clickedFrame === menu && button4.isPressed()) {
    skinsmenu.visible = !skinsmenu.visible;
}
if (clickedFrame === menu && buttonshop.isPressed()) {
    shopmenu.visible = !shopmenu.visible;
}
if (clickedFrame === menu && buttonSettings.isPressed()) {
    settings.visible = !settings.visible;
}






if (player) {
    currentWeapon.x = player.x - currentWeapon.width / 2;
    currentWeapon.y = player.y - currentWeapon.height / 2;
    currentWeapon.translate(mouseX - player.x, mouseY - player.y);
    
    gunDraw();

        if (
        currentWeapon.name === "Dual Wield" &&
        glassesImage.complete &&
        glassesImage.naturalWidth > 0
    ) {
        ctx.drawImage(
            glassesImage,
            player.x - player.radius,
            player.y - player.radius,
            player.radius * 2,
            player.radius * 2
        );
    }
    getAccessory();
    info.visible = true;
    
    info.x = player.x +25 ;
    info.y = player.y - 30;

    infotext1.x = info.x + 10;
    infotext1.y = info.y + 10;
    infotext1.color = isDarkMode ? "#fffefe" : "#000000";
    infotext1.text = `Weapon: ${currentWeapon.name} | Ammo: ${
    currentWeapon.ammo === Infinity ? "Inf" : currentWeapon.ammo
}`;
    infotext2.x = info.x + 10;
    infotext2.y = info.y + 30;
    infotext2.color = isDarkMode ? "#fffefe" : "#000000";
    infotext2.text = `Health: ${player.health}`;
} else {
    info.visible = false;
}
info.draw(ctx);
if (keys['f'] && !fWasPressed && player) {
    const newProjectiles = currentWeapon.shoot(player, mouseX, mouseY);
    balls.push(...newProjectiles);
}

fWasPressed = keys['f'];


if (skinsmenu.visible) {
    if (clickedFrame === skinsmenu && button5.isPressed()) {
        balls[0].color = "red";
    }

    if (clickedFrame === skinsmenu && button6.isPressed()) {
        balls[0].color = "blue";
    }
    if (clickedFrame === skinsmenu && button7.isPressed()) {
        balls[0].color = "green";
    }
    if (clickedFrame === skinsmenu && button8.isPressed()) {
        balls[0].color = "yellow";
    }
}
if (shopmenu.visible) {
    if (buttonshopGun.isPressed()) {
        showCategory("Guns");
    } else if (buttonshopUtil.isPressed()) {
        showCategory("Utility");
    } else if (buttonshopSkins.isPressed()) {
        showCategory("Skins");
    } else if (buttonshopArmor.isPressed()) {
        showCategory("Armor");
    }

    for (const entry of itemButtons) {
        if (entry.button.isPressed()) {
            entry.item.action();
        }
    }
}
if(settings.visible&&clickedFrame===settings){
    if(bgButton.isPressed()&& !bgCooldown){
        isDarkMode=!isDarkMode;
        bgCooldown = true;
        setTimeout(() => {
            bgCooldown = false;
        }, BG_COOLDOWN_MS);
    }
}

    

if (menu.visible && clickedFrame === menu) {
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
            radius: radius,
            health: 100,
            maxHealth: 100,
            isDead: false,
            isEnemy: true,
            following: false
        };

        balls.push(newBall);

        const frameIndex = ballFrames.length;
        const frameX = 350 + (frameIndex % 2) * 230;
        const frameY = 100 + Math.floor(frameIndex / 2) * 140;
        const newFrame = new Frame(
            frameX, frameY, 200, 120, "lightgray", 0.5, newBall, true
        );
        newFrame.visible = true;

        const moveButton = new Button(
            newFrame.x + 25, newFrame.y + 40,
            100, 30, "Move Ball", "darkgray", .5
        );
        const followButton = new Button(
            newFrame.x + 125, newFrame.y + 40,
            50, 30, "Follow Ball", "darkgray", .5
        );

        const stopButton = new Button(
            newFrame.x + 25, newFrame.y + 75,
            150, 30, "Stop Ball", "darkgray", .5
        );

        newFrame.addButton(moveButton);
        newFrame.addButton(stopButton);
        newFrame.addButton(followButton);
        frameOrder.push(newFrame);
        ballFrames.push(newFrame);
    }
}

function startFollowing(ball) {
    const player = balls.find(b => b.isPlayer);
    if (!player) return;

    const dx= player.x - ball.x;
    const dy= player.y - ball.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 0) {
        ball.dx = (dx / distance) * 2;
        ball.dy = (dy / distance) * 2;
    }
}
function startRandomMovement(ball) {
    clearTimeout(ball.randomMovementTimer);

    const changeDirection = () => {
        ball.dx = Math.random() < 0.5 ? -2 : 2;
        ball.dy = Math.random() < 0.5 ? -2 : 2;
        ball.randomMovementTimer = setTimeout(
            changeDirection,
            500 + Math.random() * 2000
        );
    };

    changeDirection();
}

for (const frame of ballFrames){
    if (frame.ball.remove || !balls.includes(frame.ball)){
        continue;
    }
    if(clickedFrame===frame){
        if(frame.buttons[0].isPressed()){
            startRandomMovement(frame.ball);
        }
        if(frame.buttons[1].isPressed()){
            clearTimeout(frame.ball.randomMovementTimer);
            frame.ball.randomMovementTimer = null;
            frame.ball.dx = 0;
            frame.ball.dy = 0;
        }
        if(frame.buttons[2].isPressed()){
            frame.ball.following=true;
        }
    }
}
frameOrder = frameOrder.filter(frame =>
    !ballFrames.includes(frame) ||
    (frame.ball && !frame.ball.remove && balls.includes(frame.ball))
);

for (const frame of frameOrder) {
    drawFrame(frame);
}
balls = balls.filter(ball =>
    !ball.remove &&
    (!ball.isProjectile || Date.now() - ball.createdAt < 3000)
);
    justClicked=false;
    requestAnimationFrame(animate);
}



animate();