const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;
const radius = 20;
let keys = {};
let fWasPressed = false;
let gWasPressed = false;
let mouseX=0;
let mouseY=0;
let mouseDown=false;
let justClicked = false;
let isDarkMode = false;
let bgCooldown = false;
const BG_COOLDOWN_MS = 1000;

let gameScreen = "mainMenu";
let gameMode = null;
// Placeholders
let enemyCountMax=2;
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
    "Crown": new Image(),
    "Cool Armor": new Image()
}
accessoryImages["Glasses"].src = "assets/glasses.png";
accessoryImages["Top Hat"].src = "assets/Top_Hat.png";
accessoryImages["Monocle"].src = "assets/monocle.png";
accessoryImages["Crown"].src = "assets/Crown.png";
accessoryImages["Cool Armor"].src = "assets/glasses.png";

const weaponImages= {
    "Pistol": new Image(),
    "Shotgun": new Image(),
    "Sniper": new Image(),
    "Explosive Sniper": new Image(),
    "Katana": new Image(),
    "Nodachi": new Image(),
    "Dragon Slayer": new Image()
}
weaponImages["Pistol"].src = "assets/Pistol.png";
weaponImages["Shotgun"].src = "assets/Shotgun.png";
weaponImages["Sniper"].src = "assets/Sniper.png";
weaponImages["Explosive Sniper"].src = "assets/Sniper.png";
weaponImages["Katana"].src = "assets/Katana.png";
weaponImages["Nodachi"].src = "assets/Katana.png";
weaponImages["Dragon Slayer"].src = "assets/DragonSlayer.png"; //placeholder
let stats = {
    speed: 1,
    health: 100,
    damage: 10,
    fireRate: 1,
    armor: 0
}
let currentCategory = "Guns";
/*
plans (not implemented yet):
guns: rocket launcher???
add powerups: health, speed, damage, armor

add: melee

for menu:
add < > to switch between categories in shop,
also if theres more than 1 page of whatever

for mobile: add touch controls and improve shooting, draggable aim?

for objects: add walls (penetration, less dmg/deflect/absorb)

for enemies: give them guns/weapons (melee preferably)

for weapons: add rpg, then use explosion for grenade (utility)

for gameplay: add random events (2x money multiGplier?)
add sound
add gamemode, will need a new main menu button

other fun options: 2 player in 1 device mode?
map creation? (will need export/import)

note: fix bug where player can still shoot when dead.
*/

/*
Wave mode:
wave 1: 1 ball
wave 2: 2 balls
wave 3: 5 balls
wave 4: 10 balls
wave 5: big ball, 3 balls
*/

let balls =[
    { x: canvas.width / 2, y: canvas.height / 2, dx: 0, dy: 0 ,color: "blue",radius: radius,isPlayer: true, health: getMaxHealth(), maxHealth: getMaxHealth(),hit: false, isDead: false, weapon: null, remove: false, ammo: Infinity, isProjectile: false, createdAt: null, following: false, speed: stats.speed}
]
let objects = [];
let explosions = [];

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

const modeSelectButtons = [
    new Button(300, 200, 200, 50, "Sandbox Mode", "lightblue", 0.5),
    new Button(300, 300, 200, 50, "Sandbox Mode + 1 FollowEnemy", "lightblue", 0.5),
    new Button(300, 400, 200, 50, "Back", "lightblue", 0.5)
]

function spawnEnemy(weapon) {
    enemyCounter++;
    balls.push({
        x: 100,
        y: 100,
        dx: 0,
        dy: 0,
        color: "red",
        radius: radius,
        health: 100,
        maxHealth: 100,
        hit: false,
        isDead: false,
        isEnemy: true,
        following: true,
        weapon: weapon
    });
}

function drawModeSelect() {
    ctx.fillStyle = isDarkMode ? "#2b2828" : "white";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Select Game Mode", canvas.width / 2, 100);
    for (const button of modeSelectButtons) {
        button.draw(ctx);
    }
    if(justClicked){
        if (modeSelectButtons[0].isPressed()) {
            gameScreen = "game";
            gameMode = "sandbox";
        } else if (modeSelectButtons[1].isPressed()) {
            balls= balls.filter(ball => ball.isPlayer);
            spawnEnemy("Katana");
            spawnEnemy("Katana");
            gameScreen = "game";
            gameMode = "wave";
        } else if (modeSelectButtons[2].isPressed()) {
            gameScreen = "mainMenu";
        }
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
        if (type === "speedboost") {
            this.x = Math.random() * (canvas.width - 20) + 10;
            this.y = Math.random() * (canvas.height - 20) + 10;
            this.width = 20;
            this.height = 20;
            this.radius = 10;
            this.color = "blue";
            this.type = "speedboost";
            this.healAmount = 0;
            this.speedAmount = .2;

            this.scale=3;
            this.startTime=performance.now();
            this.duration=1000;
            this.durationBoost=5000;
        }
        if (type === "mine") {
            this.x = Math.random() * (canvas.width - 20) + 10;
            this.y = Math.random() * (canvas.height - 20) + 10;
            this.width = 20;
            this.height = 20;
            this.radius = 10;
            this.color = "black";
            this.type = "mine";
            this.healAmount = 0;
            this.speedAmount = 0;
            this.explosive = true;
            this.explosionRadius = 90;
            this.explosionDamage = 50;

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
        } else if (this.type === "mine") {
            r = 0;
            g = 0;
            b = 0;
        } else if (this.type === "speedboost") {
            r = 0;
            g = 0;
            b = 255;
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
    constructor(name, damage, fireRate, ammo, projectileSpeed = 5, bulletCount = 1, spread = 0, explosive=false, explosionRadius=90, explosionDamage=damage) {
        this.name = name;
        this.damage = damage;
        this.fireRate = fireRate;
        this.ammo = ammo;
        this.projectileSpeed = projectileSpeed;
        this.bulletCount = bulletCount;
        this.spread = spread;
        this.explosive = explosive;
        this.explosionRadius = explosionRadius;
        this.explosionDamage = explosionDamage;
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
            this.height=40;
            this.angle=0;
            this.lastShot=0;
            this.offsetX=0;
            this.offsetY=-10;
        }
        if(this.name==="Explosive Sniper"){
            this.x=0;
            this.y=-25;
            this.width=90;
            this.height=40;
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
                damage: this.damage,

                isExplosive: this.explosive,
                explosionRadius: this.explosionRadius,
                explosionDamage: this.explosionDamage,
            })
        }

        return projectiles;
    }
    
    
}

let soundEnabled = false;

function playSound() {
    const audio = new AudioContext();
    const oscillator = audio.createOscillator();
    const gain= audio.createGain();

    oscillator.type = 'square';
    oscillator.frequency.value=100;
    gain.gain.value=0.1;
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + 0.1);
}
class melee {
    constructor(name, damage, range) {
        this.name = name;
        this.damage = damage;
        this.range = range;
        this.swinging = false;
        this.swingStart=0;
        this.swingDuration=300;
        this.hitEnemies= new Set();
    }

    swing(){
        if (this.swinging) return;
        this.swinging=true;
        this.swingStart=Date.now();
        this.hitEnemies.clear();
    }

    draw(ctx, player, mouseX, mouseY) {
        if (!this.swinging) return;
        const elapsed = Date.now() - this.swingStart;
        const progress = Math.min(elapsed / this.swingDuration, 1);

        const aimAngle = Math.atan2(mouseY - player.y, mouseX - player.x);

        const swingAngle = aimAngle + (Math.PI / 4) * (1 - progress);
        const image = weaponImages[this.name];
        var Slayer=0;
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(swingAngle);
        if (image.complete && image.naturalWidth > 0) {
            if(this.name==="Dragon Slayer"){
                Slayer=40;
            }
            ctx.drawImage(image, 0, -50-(Slayer/2), this.range, 40+Slayer);
        }
        ctx.restore();

        if(progress>=1){
            this.swinging=false;
        }
    }

    update(player, mouseX, mouseY) {
        if (!this.swinging) return;
        const bladeLength = this.range;

        const elapsed = Date.now() - this.swingStart;
        const progress = Math.min(elapsed / this.swingDuration, 1);
        for (const enemy of balls) {
                if (!enemy.isEnemy || enemy.isDead || enemy.remove || this.hitEnemies.has(enemy)){
                    continue;
                }
                const dx = enemy.x - balls[0].x;
                const dy = enemy.y - balls[0].y;
                
                const aimAngle = Math.atan2(mouseY - balls[0].y, mouseX - balls[0].x);

                const localX= dx*Math.cos(-aimAngle)-dy*Math.sin(-aimAngle);
                const localY= dx*Math.sin(-aimAngle)+dy*Math.cos(-aimAngle);

                const closestX= Math.max(0, Math.min(localX, bladeLength));
                const closestY = Math.max(-50, Math.min(localY, -10));  
                const distanceSq= (localX-closestX)*(localX-closestX)+(localY-closestY)*(localY-closestY);

                if (distanceSq <= enemy.radius * enemy.radius) {                    
                    this.hitEnemies.add(enemy);
                    enemy.health -= this.damage;
                    enemy.color = "lightcoral";

                    if(enemy.health <= 0){
                        enemy.isDead = true;
                        enemy.transparency = 0.95;
                        enemy.dx=0;
                        enemy.dy=0;

                        setTimeout(() => {
                            enemy.remove = true;
                            money+= 10;
                            if(gameMode==="wave"){
                                enemyCounter--;
                            }
                        }, 1000);
                    }
                    else {
                        setTimeout(() => {
                            if (!enemy.isDead) {
                                enemy.color = "red";
                            }
                        }, 200);
                    }
                }
                
            }
            if (progress >= 1) {
                    this.swinging = false;
                }

        }
    }

 function drawEnemyWeapon(enemy){
        if (!enemy.isEnemy || enemy.isDead || enemy.remove || !enemy.weapon) {
            return;
        }

        const weaponImage = weaponImages[enemy.weapon];

        if(!weaponImage || !weaponImage.complete || weaponImage.naturalWidth === 0){
            return;
        }
        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(Math.atan2(balls[0].y - enemy.y, balls[0].x - enemy.x));
        ctx.drawImage(weaponImage,enemy.radius-25,-enemy.radius-25, 50, 50);

        ctx.restore();
    }

    function enemyShoot(enemy){
        if (!enemy.isEnemy || enemy.isDead || enemy.remove || !enemy.weapon) {
            return;
        }
        if (enemy.shootCooldown>0){
            return;
        }
        if (enemy.weapon === "Katana" || enemy.weapon === "Nodachi" || enemy.weapon === "Dragon Slayer") {
            return;
        }
        const player = balls.find(ball => ball.isPlayer);
        if (!player || player.isDead || player.remove) {
            return;
        }
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const baseGun = globalThis.Object.values(weapons).find(w => w.name === enemy.weapon);
        if (!baseGun) {
            return;
        }
        if (!enemy.gun) {
            enemy.gun = new Gun(
                baseGun.name, 
                baseGun.damage, 
                baseGun.fireRate, 
                Infinity,
                baseGun.projectileSpeed, 
                baseGun.bulletCount, 
                baseGun.spread,
                baseGun.explosive, 
                baseGun.explosionRadius, 
                baseGun.explosionDamage
            );
        }

        if (distance === 0) {
            return;
        }

        const gun = enemy.gun;
        if (!gun) {
            return;
        }

        const projectiles = gun.shoot(enemy, player.x, player.y);
        for (const projectile of projectiles) {
            projectile.isEnemyBullet = true;
            projectile.color="orange";
            projectile.owner = enemy;
        }
        balls.push(...projectiles);

        enemy.shootCooldown = enemy.shootDelay;
    }

const katana = new melee("Katana", 20, 50);
const nodachi = new melee("Nodachi", 50, 100);
const dragonslayer = new melee("Dragon Slayer", 75, 150);
let currentMelee = katana;

function createExplosion(x, y, radius, damage) {
    explosions.push({ x, y, radius, damage, createdAt: Date.now(),duration: 250});

    for (const enemy of balls) {
        if (!enemy.isEnemy || enemy.isDead || enemy.remove) {
            continue;
        }
        const dx = enemy.x - x;
        const dy = enemy.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= radius + enemy.radius) {
            enemy.health -= damage;
            enemy.color = "orange";

            if (enemy.health <= 0) {
                enemy.isDead = true;
                enemy.transparency = 0.95;
                enemy.dx = 0;
                enemy.dy = 0;

                setTimeout(() => {
                    if (!enemy.remove) {
                        enemy.remove = true;
                        if(gameMode==="wave"){
                                enemyCounter--;
                            }
                        money += 10;
                        
                    }
                }, 800);
            } else {
                setTimeout(() => {
                    if (!enemy.isDead) {
                        enemy.color = "red";
                    }
                }, 200);
            }
        }
    }

    const player = balls.find(ball => ball.isPlayer);
    if (!player || player.isDead || player.remove) {
        return;
    }
    const dx = player.x - x;
    const dy = player.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < radius + player.radius) {
        player.health -= damage * 0.1;
        player.health = Math.max(0, player.health);

        if (player.health <= 0) {
            player.isDead = true;
            player.transparency = 0.95;

            setTimeout(() => {
                player.isDead = false;
                player.health = getMaxHealth();
                player.x= canvas.width / 2;
                player.y= canvas.height / 2;
                player.dx=0;
                player.dy=0;
            }, 2000);
    }
    }
}


const glassesImage = new Image();
glassesImage.src = "assets/glasses.png";



const bushImage = new Image();
bushImage.src = "assets/bush.png";



const treeImage = new Image();
treeImage.src = "assets/tree.png";

const wallImage = new Image();
wallImage.src = "assets/wall.png";

const bushes = [];
const trees = [];
const walls = [];
let wallsVisible = false;

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

class Wall {
    constructor(x, y, width = 100, height = 20, options = {}) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.bulletBehavior = options.bulletBehavior || "deflect";
        this.solid = options.solid ?? true;
    }

    draw(ctx) {
        if (wallImage.complete && wallImage.naturalWidth > 0) {
            ctx.drawImage(
                wallImage,
                this.x,
                this.y,
                this.width,
                this.height
            );
        }
    }
}

function handleWallCollision() {
    for (let i=balls.length-1; i>=0; i--) {
        const ball = balls[i];
        if (ball.isDead || ball.remove) {
            continue;
        }

        for (const wall of walls) {
            if (!wall.solid||wallsVisible===false) {
                continue;
            }
            const closestX = Math.max(wall.x, Math.min(ball.x, wall.x + wall.width));
            const closestY = Math.max(wall.y, Math.min(ball.y, wall.y + wall.height));
            let dx= ball.x - closestX;
            let dy= ball.y - closestY;
            const distanceSq = dx * dx + dy * dy;

            if (distanceSq >=ball.radius * ball.radius) continue;
            let nx,ny;
            const distance = Math.sqrt(distanceSq);
            if(distance>0.00001){
                nx= dx/distance;
                ny= dy/distance;
            } else {
                const sides = [
                    { x: wall.x, y: wall.y + wall.height / 2 },
                    { x: wall.x + wall.width, y: wall.y + wall.height / 2 },
                    { x: wall.x + wall.width / 2, y: wall.y },
                    { x: wall.x + wall.width / 2, y: wall.y + wall.height }
                ];
                let minDistSq = Infinity;
                let closestSide = null;
                for (const side of sides) {
                    const sideDx = ball.x - side.x;
                    const sideDy = ball.y - side.y;
                    const sideDistSq = sideDx * sideDx + sideDy * sideDy;
                    if (sideDistSq < minDistSq) {
                        minDistSq = sideDistSq;
                        closestSide = side;
                    }
                }
                if (closestSide) {
                    nx = closestSide.x - ball.x;
                    ny = closestSide.y - ball.y;
                }


            }
            
            if (ball.isProjectile) {

                if(wall.bulletBehavior === "penetrate"){
                    continue;
                }
                if (wall.bulletBehavior === "destroy"){
                    ball.remove=true;
                    break;
                }
                if(wall.bulletBehavior === "deflect"){

                    const dot = (ball.dx * nx + ball.dy * ny);
                    if (dot < 0) {
                        ball.dx -= 2 * dot * nx;
                        ball.dy -= 2 * dot * ny;
                    }

                    else{
                        continue;
                    }
                } else{
                    const dot = (ball.dx * nx + ball.dy * ny);
                    if (dot < 0) {
                        ball.dx -= 2 * dot * nx;
                        ball.dy -= 2 * dot * ny;
                    }
                }
            }
            const penetrationDepth = ball.radius - distance;
            if (distance > 0.00001) {
                ball.x += nx * penetrationDepth;
                ball.y += ny * penetrationDepth;
            } else{
                ball.x += penetrationDepth;
                ball.y += penetrationDepth;
            }
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

walls.push(new Wall(700,500, 200,20, { bulletBehavior: "deflect", solid: true }));

walls.push(new Wall(0,500, 200,20, { bulletBehavior: "destroy", solid: true }));

walls.push(new Wall(700, 100, 10, 200, { bulletBehavior: "penetrate", solid: true }));
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
    Shotgun: new Gun("Shotgun", 15, 1, 240, 5, 5, 0.5),
    Sniper: new Gun("Sniper", 100, 0.5, 50, 10, 1),
    ExplosiveSniper: new Gun("Explosive Sniper", 100, 0.5, 50, 10, 1,0,true,120,100),
    DualWield: new Gun("Dual Wield", 8, 5, Infinity)
};

const shopItems = {
    Guns: [
        { name: "Pistol", action: () => currentWeapon = weapons.Pistol },
        { name: "Shotgun", action: () => currentWeapon = weapons.Shotgun },
        { name: "Sniper", action: () => currentWeapon = weapons.Sniper },
        { name: "Explosive Sniper", action: () => currentWeapon = weapons.ExplosiveSniper },
        { name: "Dual Wield", action: () => currentWeapon = weapons.DualWield },
        { name: "Katana", action: () => currentMelee= katana },
        { name: "Nodachi", action: () => currentMelee= nodachi },
        { name: "Dragon Slayer", action: () => currentMelee= dragonslayer }
    ],
    Utility: [
        { name: "Heal Package", action: () => objects.push(new Object("heal")) },
        { name: "Big Rock", action: () => objects.push(new Object("rock")) },
        { name: "Speed Boost", action: () => objects.push(new Object("speedboost")) },
        { name: "Mine", action: () => objects.push(new Object("mine")) }
    ],
    Skins: [
        { name: "Red Ball", action: () => balls[0].color = "red" },
        { name: "Blue Ball", action: () => balls[0].color = "blue" },
        ...accessories.map(name => ({ name,price: name=== "Crown" ? 10 : 0, action: () => wearAccessory(name)}))
    ],
    Armor: [
        { name: "Leather Armor", action: () => equipArmor(5, "Leather Armor") },
        { name: "Iron Armor", action: () => equipArmor(10, "Iron Armor") },
        { name: "Gold Armor", action: () => equipArmor(15, "Gold Armor") },
        { name: "Cool Armor", action: () => equipArmor(20, "Cool Armor") }
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
    } else {
        playSound();
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

    if (player.armorName === "Cool Armor") {
        const armorImage = accessoryImages["Cool Armor"];

        ctx.drawImage(
            armorImage,
            player.x - player.radius,
            player.y - player.radius,
            player.radius * 2,
            player.radius * 2
        );

}

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
function equipArmor(armorValue, armorName) {
    const player = balls.find(ball => ball.isPlayer);
    if (!player) return;

    const oldMaxHealth = player.maxHealth;
    player.armorName=   armorName;
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
const mainmenu = new Frame(
    250, 250, 300, 250, "lightgray", 0.5, null, false
);
const mainmenuButton1 = new Button(
    300, 300, 200, 50, "Start Game", "lightgreen", 0.5
);


const menubutton = new Button(
    100, 300, 50, 50, "Menu", "lightgreen", 1
);
const mobilebutton = new Button(
    canvas.width-50, canvas.height-50, 50, 50, "Mobile", "lightblue", 1
);
const mobileW = new Button(
    75, canvas.height-150, 75, 75, "W", "lightblue", 1
)
const mobileA = new Button(
    0, canvas.height-75, 75, 75, "A", "lightblue", 1
)
const mobileS = new Button(
    75, canvas.height-75, 75, 75, "S", "lightblue", 1
)
const mobileD = new Button(
    150, canvas.height-75, 75, 75, "D", "lightblue", 1
)
const mobileShoot = new Button(
    canvas.width-150, canvas.height-75, 75, 75, "Shoot", "lightyellow", 1
);
mobileW.visible=false;
mobileA.visible=false;
mobileS.visible=false;
mobileD.visible=false;
mobileShoot.visible=false;
const menu = new Frame(
    250, 250, 300, 250, "lightgray", 0.5, null, true
);

const settings = new Frame(
    400, 400, 300, 250, "darkgray", 0.5, null, true
);
const globalStopFollow = new Button(
    450, 300, 50, 50, "Stop Follow", "red", 0.5
);
const bgButton = new Button(
    450, 450, 150, 50, "Change Background", "lightgray", 0.5
);
const toggleWall = new Button(
    450, 500, 150, 50, "Toggle Wall", "lightgray", 0.5
);
const toggleSound = new Button(
    450, 550, 150, 50, "Toggle Sound", "lightgray", 0.5
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
mainmenu.addButton(mainmenuButton1);
mainmenu.visible=true;

menu.addButton(button);
menu.addButton(button2);
menu.addButton(button3);
menu.addButton(button4);
menu.addButton(buttonshop);
menu.addButton(buttonSettings);
menu.addButton(globalStopFollow);
skinsmenu.addButton(button5);
skinsmenu.addButton(button6);
skinsmenu.addButton(button7);
skinsmenu.addButton(button8);

settings.addButton(bgButton);
settings.addButton(toggleWall);
settings.addButton(toggleSound);
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
    if (gameScreen === "mainMenu") {
        mainmenu.draw(ctx);

    if (mainmenuButton1.isPressed()) {
        gameScreen = "modeSelect";
    }
} else if (gameScreen === "modeSelect") {
    drawModeSelect();
    } else if (gameScreen === "game") {
    ctx.fillStyle = isDarkMode ? "#fffefe" : "#000000";
    ctx.font = "16px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    ctx.fillText(`Money: ${money}`, 10, 10);
    if (gameMode === "wave") {
        ctx.fillText(`Wave: ${wave}`, 10, 30);
        ctx.fillText(`Enemies: ${enemyCounter}/${enemyCountMax}`, 10, 50);
        if (enemyCounter <=0 && enemyCountMax===2) {
            wave++;
            enemyCountMax += 2;
            spawnEnemy("Pistol");
            spawnEnemy("Katana");
            spawnEnemy("Katana");
            spawnEnemy("Katana");
        }
    }
    menubutton.draw(ctx);
    // mobilebutton.draw(ctx);
    if (mobileW.visible) {
    mobileW.draw(ctx);
}
    if (mobileA.visible) {
    mobileA.draw(ctx);
}
    if (mobileS.visible) {
    mobileS.draw(ctx);
}
    if (mobileD.visible) {
    mobileD.draw(ctx);
}
    if (mobileShoot.visible) {
    mobileShoot.draw(ctx);
}
    bushes.forEach(bush => bush.draw(ctx));
    trees.forEach(tree => tree.draw(ctx));
    if (wallsVisible) {
    walls.forEach(wall => wall.draw(ctx));
    }
    handleWallCollision();
for (const ball of balls) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.globalAlpha = ball.isDead ? 0.25 : 1;
    ctx.fill();
    ctx.globalAlpha = 1;

    drawEnemyWeapon(ball);
    if(ball.isEnemy){
        enemyShoot(ball);
        ball.shootCooldown = Math.max(0, ball.shootCooldown - 1);
    }

    if (ball === balls[0]) {
        const run = keys["shift"] ? 1.5 : 1;
        if (keys['w'] || (mobileW.visible && mobileW.update())) {
        ball.y -= 2 * stats.speed * run;
    }
        if (keys['s'] || (mobileS.visible && mobileS.update())) {
        ball.y += 2*stats.speed * run;
    }
        if (keys['a'] || (mobileA.visible && mobileA.update())) {
        ball.x -= 2*stats.speed * run;
    }
        if (keys['d'] || (mobileD.visible && mobileD.update())) {
        ball.x += 2*stats.speed * run;
    }
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
    let projectile = null;
    let target = null;

if (ball1.isProjectile && !ball2.isProjectile) {
        projectile = ball1;
        target = ball2;
    } else if (ball2.isProjectile && !ball1.isProjectile) {
        projectile = ball2;
        target = ball1;
    }

    if (projectile && target && !projectile.remove && !target.remove && !target.isDead) {
        const correctTarget = projectile.isEnemyBullet
            ? target.isPlayer
            : target.isEnemy;

        const dx = target.x - projectile.x;
        const dy = target.y - projectile.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (correctTarget && distance < projectile.radius + target.radius) {
            projectile.remove = true;

            if (target.isPlayer) {
                target.health -= projectile.damage;
                target.health = Math.max(0, target.health);
                target.color = "lightblue";

            
                
                setTimeout(() => {
                if (!target.isDead) {
                        target.color = "blue";
                    }
                }, 200);

            if (target.health <= 0) {
                    target.isDead = true;

                    setTimeout(() => {
                        target.isDead = false;
                        target.health = target.maxHealth;
                        target.x = canvas.width / 2;
                        target.y = canvas.height / 2;
                        target.dx = 0;
                        target.dy = 0;
                        target.color = "blue";
                    }, 2000);
                }
            } else {
                target.hit = true;
                target.color = "lightcoral";
                target.health -= projectile.damage;

                if (projectile.isExplosive) {
                    createExplosion(
                        projectile.x,
                        projectile.y,
                        projectile.explosionRadius,
                        projectile.explosionDamage
                    );
                }

                if (target.health <= 0) {
                    target.isDead = true;
                    target.transparency = 0.95;
                    target.dx = projectile.dx / 15;
                    target.dy = projectile.dy / 15;

                    setTimeout(() => {
                        if (!target.remove) {
                            target.remove = true;
                            if(gameMode==="wave"){
                                enemyCounter--;
                            }
                            money += 10;
                        }
                    }, 800);
                } else {
                    setTimeout(() => {
                        if (!target.isDead && !target.remove) {
                            target.color = "red";
                        }
                        target.hit = false;
                    }, 200);
                }
            }
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

       for (const explosion of explosions) {
        const progress = Math.min(
            (Date.now() - explosion.createdAt) / explosion.duration,
            1
        );

        ctx.save();
        ctx.globalAlpha = 1 - progress;
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(
            explosion.x,
            explosion.y,
            explosion.radius * progress,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.restore();
    }

    explosions = explosions.filter(
        explosion => Date.now() - explosion.createdAt < explosion.duration
    );
      
    const player = balls.find(ball => ball.isPlayer);
    if (player) {
        for (const obj of objects) {
            if (["heal", "rock", "speedboost", "mine"].includes(obj.type)) {                
                obj.draw(ctx);
                const closestX = Math.max(
            obj.x,
            Math.min(player.x, obj.x + obj.width)
        );
            if (obj.type === "mine") {
                if (player.isDead || player.remove) continue;
                let dx = player.x - obj.x;
                let dy = player.y - obj.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < obj.radius + player.radius) {
                    createExplosion(
                        obj.x,
                        obj.y,
                        obj.explosionRadius,
                        obj.explosionDamage
                    );

                    obj.remove = true;
                    continue;
                }

            for (const enemy of balls) {
                if (!enemy.isEnemy || enemy.isDead || enemy.remove) continue;

                const dx = enemy.x - obj.x;
                const dy = enemy.y - obj.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < obj.radius + enemy.radius) {
                    createExplosion(
                        obj.x,
                        obj.y,
                        obj.explosionRadius,
                        obj.explosionDamage
                    );

                    obj.remove = true;
                    break;
                }
            }

    continue;
}
        

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
            if (obj.type === "speedboost") {
                stats.speed += obj.speedAmount;
                setTimeout(() => {
                    stats.speed -= obj.speedAmount;
                }, obj.durationBoost);
            }

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
if (!clickedFrame && mobileShoot.isPressed() && player) {
    const newProjectiles = currentWeapon.shoot(player, mouseX, mouseY);
    balls.push(...newProjectiles);
}
if (!clickedFrame && mobilebutton.isPressed()) {
    // mobileW.visible = !mobileW.visible;
    // mobileA.visible = !mobileA.visible;
    // mobileS.visible = !mobileS.visible;
    // mobileD.visible = !mobileD.visible;
    // mobileShoot.visible = !mobileShoot.visible;
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
    currentMelee.update(player,mouseX, mouseY);
    currentMelee.draw(ctx, player, mouseX, mouseY);
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
if (keys['g'] && !gWasPressed && player) {
    currentMelee.swing();
}

fWasPressed = keys['f'];
gWasPressed = keys['g'];

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

    if(toggleWall.isPressed()){
        wallsVisible = !wallsVisible;
    }
    if(toggleSound.isPressed()){
        soundEnabled = !soundEnabled;
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
    if (globalStopFollow.isPressed()) {
        for (const ball of balls) {
            ball.following = false;
        }
    }

    if (button3.isPressed()) {
        const weaponslist = ["Katana", "Nodachi", "Dragon Slayer", "Pistol", "Shotgun", "Sniper"];  
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
            following: false,
            weapon: null, //weaponslist[Math.floor(Math.random() * weaponslist.length)]
            shootCooldown: 0,
            shootDelay: 1000,
            accessory: accessories[Math.floor(Math.random() * accessories.length)],
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
    

}
    justClicked=false;
    requestAnimationFrame(animate);
}



animate();