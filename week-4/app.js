const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;
const radius = 20;
let keys = {};
let fWasPressed = false;
let gWasPressed = false;
let mWasPressed = false;
let nWasPressed = false;
let hWasPressed = false;
let mouseX=0;
let mouseY=0;
let mouseDown=false;
let justClicked = false;
let isDarkMode = false;
let bgCooldown = false;
const BG_COOLDOWN_MS = 1000;

let gameScreen = "mainMenu";
let gameMode = null;
let waveDifficulty = "easy";
let selectedMap = "default";
const maps = ["default", "map1", "map2"];
// Placeholders
let enemyCountMax=2;
let enemyCounter=0;
let money=0;
let deaths=0;
let combo = 0;
let comboTimer = 0;
let skins = ["red", "blue", "green", "yellow", "purple"];
let enemyVariants=["red"]
let wave = 1;
let waveEnemies = [5, 10, 15, 20, 25];
let rewards = [10, 20, 30, 40, 50];
let showUpgradePrompt = false;
let waveStart=false;
let waveIndicator=null;
let waveWon = false;
let winCountdown = 5;
let storyChapter = 0;
let storyStage = 0;
let storyPhase = null;
let accessories = ["Top Hat", "Glasses", "Monocle", "Crown", "Shield"];
const enemyAccessories = {
    "Sniper": "Glasses",
    "Dragon Slayer": "Crown",
    "Shielder": "Shield"
}
let Owned = ["Blue Ball"];
let shopPage = 0;
let shopFree = true;
let tutorialStep = 0;
let tutorialTexts = [
    "Use WASD to move your ball. Press WASD to continue.",
    "Open the menu by pressing the menu button. \n (or you can press 'M')",
    "In the menu, you can buy accessories and weapons. \n Press the shop button to open the shop. (or press 'N')",
    "You can drag frames around the screen by clicking and holding the title bar. \n Drag the shop frame to continue.",
    "You can buy accessories and weapons in the shop. \n Buy an accessory to continue (anything $0).",
    "Press 'F' to shoot your weapon. \n Shoot 3 times to continue",
    "Press 'G' to melee attack. \n Melee 3 times to continue",
    "Red balls will be the enemies, you can shoot them with your weapon. \n Kill 1 enemy to go back to main menu (finish tutorial)",
]
let tutorialKeysPressed = {
    "w": 0,
    "a": 0,
    "s": 0,
    "d": 0,
}
let tutorialShopStartX = 0;
let tutorialShopStartY = 0;
let tutorialShopMoved = false;
let tutorialAccessoryBought = false;
let tutorialShots = 0;
let tutorialMelee = 0;

let dialogueQueue = [];
let currentDialogue = null;
let dialogueCharIndex = 0;
let lastCharTime = 0;

const storyChapters = {
    1: {
        title: "Chapter 1: The Beginning",
        map: "map4",
        stages: [{
            dialogue: [
                ["Commander", "Welcome to the game!"],
                ["Commander", "Our mission today is to arrive at the enemy base."],
                ["Commander", "Prepare yourself for the battle ahead."],
                ["Commander", "There are 2 melee guys ahead!"]
            ],
            
            enemies: ["Katana", "Katana"],
            reward: 10
        },
        {
            dialogue: [
                ["Commander", "Perfect job... there are more coming"],
                ["Commander", "They have guns!?!?"]
            ],
            enemies: ["Pistol", "Pistol"],
            reward: 15
        }
        
    ],
    outro: [{
        dialogue: [
            ["Commander", "Congrats, you've made it to their base."],
            ["Commander", "Your next mission will be given soon."]
        ],
        map: "map4p2"
    }]
    },

    2: {
        title: "Chapter 2: Enemy territory",
        map: "map5",
        stages: [{
            dialogue: [
                ["Commander", "We are now inside enemy territory"],
                ["Commander", "Your objective is to reach their main base"],
                ["Commander", "Be careful, there are enemies everywhere."],
                ["Commander", "There are multiple melee guys ahead!"]
            ],
            
            enemies: ["Katana", "Katana","Katana","Katana"],
            reward: 15
        },
        {
            dialogue: [
                ["Commander", "More incoming enemies"],
                ["Commander", "Beware, they are heavily armed!"]
            ],
            enemies: ["Pistol", "Shotgun","Shotgun"],
            reward: 15
        },
        {
            dialogue: [
                ["Commander", "Take cover, theres a sniper nearby!"]
            ],
            enemies: ["Sniper", "Katana","Katana"],
            reward: 15
        },
        {
            dialogue: [
                ["Commander", "We've secured the entrance, now we need to hold this position while we open this gate."]
            ],
            enemies: [],
            reward: 20,
            objective: {
                type: "capture",
                x: 400,
                y: 300,
                radius: 65,
                duration: 5
            }
        },
        {
            map: "map5u",
            dialogue: [
                ["Commander", "We are now in the upper floor."],
                ["Commander", "Be careful, there are enemies here too."],
                ["Commander", "We will move towards the command center."]
            ],
            enemies: ["Pistol", "Pistol","Shotgun", "Katana"],
            reward: 25
        },
        {
            map: "map5p2",
            dialogue: [
                ["Commander", "We are now in the command center"],
                ["Commander", "It seems like they had evacuated."],
                ["Commander", "Continue to disable their communication systems, hold the area."]
            ],
            enemies: [],
            reward: 30,
            objective: {
                type: "capture",
                x: 400,
                y: 300,
                radius: 65,
                duration: 7,
            }
        },
                    {
        map: "map5p3",
        dialogue: [
            ["Commander", "The main security door is locked."],
            ["Commander", "Find an access card nearby."]
        ],
        enemies: [],
        reward: 30,
        objective: {
            type: "collect"
        }
    },
    {
        map: "map5p4",
        dialogue: [
            ["Commander", "We're inside the security room."],
            ["Commander", "Look around for anything useful."]
        ],
        enemies: ["Pistol", "Shotgun"],
        reward: 10
    },
    {
        map: "map5p5",
        dialogue: [
            ["Commander", "Uh oh. We must have triggered an alarm!"],
            ["Commander", "Get moving! More enemies are coming."]
        ],
        enemies: ["Pistol", "Pistol", "Katana", "Shotgun"],
        reward: 15,
        alarm: true
    },
    {
        map: "map5p6",
        dialogue: [
            ["Commander", "Enemies ahead! This looks like their final security team."]
        ],
        enemies: ["Sniper", "Shotgun", "Pistol", "Katana"],
        reward: 25,
        alarm: true
    }
],
    outro: [{
        dialogue: [
            ["Commander", "Nice, work, we are almost there."],
            ["Commander", "Your next mission will be continued in the next chapter."]
        ],
        map: "map5p6"
    }]
},
3: {
        title: "Chapter 3: The Exit",
        map: "map5p6",
        stages: [{
            map: "map5p6",
            dialogue: [
                ["Commander", "Alright, the communications are down, but the area is already alerted"],
                ["Commander", "We need to get out of here fast!"],
            ],
            
            enemies: ["Katana", "Katana", "Katana", "Katana", "Katana"],
            reward: 10
        },
        {
            map: "map5p5",
            dialogue: [
                ["Commander", "Can you see that? There is somebody big blocking..."],
            ],
            enemies: ["Dragon Slayer"],
            reward: 35
        },
        {
            map: "map5p4",
            dialogue: [
                ["Commander", "That was tough, lets head out"],
            ],
            enemies: [],
            reward: 0
        },
        {
            map: "map5u",
            dialogue: [
                ["Commander", "Uhhh, there seems to be backup..."],
                ["Commander", "Pistol guys are coming in"]
            ],
            enemies: [...repeat("Pistol", 5)],
            reward: 10
        },
        {
            map: "map5",
            dialogue: [
                ["Commander", "Keep holding on"],
            ],
            enemies: [...repeat("Shotgun", 5)],
            reward: 20
        },
        {
            map: "map4p2",
            dialogue: [
                ["Commander", "Final stretch, there is just a few snipers on the other side..."],
                ["Commander", "Get behind cover!!!"]
            ],
            enemies: [...repeat("Sniper", 3)],
            reward: 20
        }
        
    ],
    
    outro: [{
        dialogue: [
            ["Commander", "That was too close. But you made it."],
            ["Commander", "We are extracting now, your next mission will be given shortly."]
        ],
        map: "map4"
    }]
},
4: {
        title: "Chapter 4: Aftermath",
        map: "map4p2",
        stages: [{
            map: "map4p2",
            dialogue: [["Commander", "Alright, we are sending airstrikes to the area"]],
            enemies: [],
            reward: 0,
            objective: {
                type: "airstrike", duration: 6
            }
        },
        {
            map: "map6",
            dialogue: [
                ["Commander", "Nice, the airstrikes are done"],
                ["Commander", "Lets move on.."]
            ],
            enemies: [],
            reward: 0
        },
            
            {
            map: "map6p2",
            dialogue: [
                ["Commander", "Alright, their base has been destroyed now, but the area is still uncertain."],
                ["Commander", "Lets go back to base and report our findings."],
                ["Commander", "Theres a straggler enemy ahead, be careful!"],
            ],
            
            enemies: ["Katana"],
            reward: 5
        },
        {
            map: "map6p3",
            dialogue: [
                ["Commander", "Okay, there is just rubble here, but lets keep moving."],
            ],
            enemies: [],
            reward: 0
        },
        {
            map: "map6p4",
            dialogue: [
                ["Commander", "Hey, there is a basement ahead, lets check it out."],
                ["Commander", "There seems to be a lock to it, we need to find a keycard nearby."],
            ],
            enemies: [],
            reward: 30,
            objective: {
            type: "collect"
        }
        },
        {
            map: "map7",
            dialogue: [
                ["Commander", "Nice, we got access to the basement, but this place seems unharmed..."],
                ["Commander", "They must've heard us, Pistol guys are coming in"]
            ],
            enemies: [...repeat("Pistol", 5)],
            reward: 10
        },
        {
            map: "map7p2",
            dialogue: [
                ["Commander", "This seems to be an underground research facility, there are still many enemies here!"],
            ],
            enemies: [...repeat("Shotgun", 5)],
            reward: 20
        },
        {
            map: "map7p3",
            dialogue: [
                ["Commander", "Warning! There are many units ahead"],
                ["Commander", "Behind it is a door, we need to get through it fast!"]
            ],
            enemies: [...repeat("Katana", 10)],
            reward: 20,
            objective: {
                type: "capture", 
                x: 400, 
                y: 300, 
                radius: 65, 
                duration: 6 
            }
        },
        {
            map: "map7p4",
            dialogue: [
                ["Commander", "It seems like we've reached a hallway, there seems to be a sniper ahead."],
                ["Commander", "Take cover and eliminate it."]
            ],
            reward: 30,
            enemies: ["Sniper"]
        },
        {
            map: "map7p5",
            dialogue: [
                ["Commander", "Wait... hold fire! theres somebody here in the research section"],
                ["Commander", "Hes unarmed... we need to question him"]
            ],
            reward: 0,
            enemies: ["Researcher"],
            objective: {
                type: "talk", 
                radius: 95, 
                duration: 6 
            }
        },
        {
            map: "map7p6",
            dialogue: [
                ["Commander", "Hey... It looks like they've been experimenting on something here..."],
                ["Commander", "There is a monster ahead, it seems to be a mutated version of the Dragon Slayer."],
            ],
            reward: 0,
            enemies: [],
            objective: {
                type:"capture",
                 x: 400,
                y: 150, 
                radius: 65, 
                duration: 6 
            }
        }
        
    ],
    
    outro: [{
        dialogue: [
            ["Commander", "Alright, we're done here."],
            ["Commander", "We will be continuing the mission in a later chapter."]
        ],
        map: "map6"
    }]
},
    
}
let airstrike = null;

function startAirstrike(duration) {
    airstrike = {
        start: Date.now(),
        duration: duration * 1000,
        bombs: [],
        nextBomb: 0,
        jet: null,
        nextJetAt: 0,
        passCount: 0
    }
}
function updateAirstrike() {
    if (!airstrike) return true;
    keys = {};
    const now = Date.now();
    const elapsed = now - airstrike.start;

    if (!airstrike.jet && elapsed < airstrike.duration && now>= airstrike.nextJetAt) {
        airstrike.jet = {
            x: (airstrike.passCount % 2 === 0 ? -100 : canvas.width + 100),
            y: 80 + Math.random() * 440,
            dir: airstrike.passCount % 2 === 0 ? 1 : -1,
            speed: 9
        };
        airstrike.passCount++;
    }
    const jet = airstrike.jet;
    if (jet) {
        jet.x += jet.dir * jet.speed;

        if(jet.x > 0 && jet.x < canvas.width && now>= airstrike.nextBomb) {
            airstrike.bombs.push({x: jet.x, y: jet.y + 20, explodeAt: now + 1000});
            airstrike.nextBomb = now + 120;
    }
    if ((jet.dir === 1 && jet.x > canvas.width + 100) || (jet.dir === -1 && jet.x < -100)) {
        airstrike.jet = null;
        airstrike.nextJetAt = now + 1000;
    }
    }
    for (const b of airstrike.bombs) {
        if (!b.done && now >= b.explodeAt) {
            b.done = true;
            createExplosion(b.x, b.y, 100, 80);
        }
    }
    const allBombsDone = airstrike.bombs.every(b => b.done);
    return elapsed >= airstrike.duration && allBombsDone && !airstrike.jet;
}
function endAirstrike() {
    airstrike = null;
}
function drawAirstrike() {
    if(!airstrike) return;
    const now = Date.now();
    ctx.save();
    for (const b of airstrike.bombs) {
        if (!b.done) {
            ctx.fillStyle = "red";
            ctx.fillRect(b.x - 5, b.y - 5, 10, 10);
        }
    }

    const jet = airstrike.jet;
    if (jet) {
        const img = weaponImages["Explosive Sniper"];
        ctx.translate(jet.x, jet.y);
        ctx.scale(jet.dir, 1);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
    }
    ctx.restore();
}

function drawAlarm() {
    if (gameMode !== "story") return;
    const stage = storyChapters[storyChapter]?.stages[storyStage];
    if (!stage || !stage.alarm) return;
    if (storyPhase !== "dialogue" && storyPhase !== "fight") return;

    const alpha = Math.floor(Date.now() / 500) % 2 === 0 ? 0.1 : 0.2;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
}

let captureProgress = 0;
let captureLastUpdate = Date.now();
let storyObjectiveComplete = false;
let hoveredShopItem = null;

let showEnemyHealthbars = true;

let paused = false
let pausedImage = null;

const weaponDescriptions = {
    "Pistol": "Basic gun",
    "Shotgun": "Close range gun",
    "Sniper": "Long range gun",
    "Explosive Sniper": "Special long range gun",
    "Katana": "Basic melee",
    "Nodachi": "Longer reach melee",
    "Dragon Slayer": "Powerful melee",
    "AK47": "Automatic gun"
}
const UtilityDescriptions = {
    "Speed Boost": "Increases movement speed",
    "Heal Package": "Increases health",
    "Mine": "Places a mine that explodes when enemies are near",
    "Big Rock": "Damage on contact"
}
const AccessoryDescriptions = {
    "Glasses": "Cool factor, aura",
    "Top Hat": "Fancy hat",
    "Monocle": "Fancy eye",
    "Crown": "Royalty",
}
const SHOP_ITEMS_PER_PAGE = 6;
const accessoryImages = {
    "Glasses": new Image(),
    "Top Hat": new Image(),
    "Monocle": new Image(),
    "Crown": new Image(),
    "Shield": new Image(),
    "Cool Armor": new Image()
}
accessoryImages["Glasses"].src = "assets/glasses.png";
accessoryImages["Top Hat"].src = "assets/Top_Hat.png";
accessoryImages["Monocle"].src = "assets/monocle.png";
accessoryImages["Crown"].src = "assets/Crown.png";
accessoryImages["Cool Armor"].src = "assets/glasses.png";
accessoryImages["Shield"].src = "assets/Shield.png";

const weaponImages= {
    "Pistol": new Image(),
    "Shotgun": new Image(),
    "Sniper": new Image(),
    "Explosive Sniper": new Image(),
    "Katana": new Image(),
    "Nodachi": new Image(),
    "Dragon Slayer": new Image(),
    "AK47": new Image(),
}
weaponImages["Pistol"].src = "assets/Pistol.png";
weaponImages["Shotgun"].src = "assets/Shotgun.png";
weaponImages["Sniper"].src = "assets/Sniper.png";
weaponImages["Explosive Sniper"].src = "assets/Sniper.png";
weaponImages["Katana"].src = "assets/Katana.png";
weaponImages["Nodachi"].src = "assets/Katana.png";
weaponImages["Dragon Slayer"].src = "assets/DragonSlayer.png";
weaponImages["AK47"].src = "assets/AK47.png";
const floorImage = new Image();
floorImage.src = "assets/floor.png";
const sandFloorImage = new Image();
sandFloorImage.src = "assets/sand.png";
const sandbagImage = new Image();
sandbagImage.src = "assets/sandbags.png";
const concrete = new Image();
concrete.src = "assets/concrete.png";
const door = new Image();
door.src = "assets/door.png";
const crate = new Image();
crate.src = "assets/crate.png";
const metal = new Image();
metal.src = "assets/metal.png";
const road = new Image();
road.src = "assets/road.png";
const fence = new Image();
fence.src = "assets/fence.png";
const server = new Image();
server.src = "assets/server.png";
const monster = new Image();
monster.src = "assets/monster.png";
const greenWallImage = new Image();
greenWallImage.src = "assets/greenwall.png";

const commanderImage = new Image();
commanderImage.src = "assets/commander.png";

function showDialogue(text, speaker = "", image = null, canSkip = true){
    dialogueQueue.push({text, speaker, image, canSkip});
    if(!currentDialogue){
        nextDialogue();
    }
}
function nextDialogue(){
    currentDialogue = dialogueQueue.shift() || null;
    dialogueCharIndex = 0;
    lastCharTime = Date.now();
}
function drawDialogue(){
    if(!currentDialogue) return;
    if(dialogueCharIndex < currentDialogue.text.length){
        if(Date.now() - lastCharTime > 30){
            dialogueCharIndex++;
            lastCharTime = Date.now();
        }
    }
    if(Date.now() - lastCharTime > 3000){
        if(dialogueCharIndex < currentDialogue.text.length){
            dialogueCharIndex = currentDialogue.text.length;
        } else if(currentDialogue.canSkip){
            nextDialogue();
            return;
        }
    }
    if(justClicked || keys[" "]){
        keys[" "] = false;
        if(dialogueCharIndex < currentDialogue.text.length){
            dialogueCharIndex = currentDialogue.text.length;
        } else if(currentDialogue.canSkip){
            nextDialogue();
            return;
        }
    }
    ctx.save();
    ctx.globalAlpha = .5;
    ctx.fillStyle = isDarkMode ? "black" : "white";
    ctx.fillRect(80, canvas.height - 75, canvas.width - 160, 75);
    ctx.strokeStyle = "#30302d";
    ctx.lineWidth = 3;
    ctx.strokeRect(80, canvas.height - 75, canvas.width - 160, 75);
    ctx.globalAlpha = .8;
    const img = currentDialogue.image;
    if(img && img.complete && img.naturalWidth > 0){
        ctx.drawImage(img, 100, canvas.height - 75, 50, 50);
    }

    ctx.fillStyle = isDarkMode ? "white" : "black";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    ctx.font = "bold 18px Arial";
    ctx.fillText(currentDialogue.speaker, 160, canvas.height - 70);

    ctx.font = "16px Arial";
    const lines = currentDialogue.text.slice(0, dialogueCharIndex).split("\n");
    for(let i = 0; i < lines.length; i++){
        ctx.fillText(lines[i], 160, canvas.height - 40 + i * 20);
    }
    ctx.restore();
}
function clearDialogue(){
    dialogueQueue = [];
    currentDialogue = null;
}
function startStoryChapter(n){
    const chapter = storyChapters[n];
    if(!chapter) return;
    balls = balls.filter(b => b.isPlayer);
    objects = [];
    explosions = [];
    grenades = [];

    const player = balls[0];
    player.health = player.maxHealth;
    player.x = mapSpawns[selectedMap]?.player[0] || canvas.width / 2;
    player.y = mapSpawns[selectedMap]?.player[1] || canvas.height / 2;
    player.dx = 0;
    player.dy = 0;

    gameMode = "story";
    shopFree = false;
    storyChapter = n;
    storyStage = 0;
    enemyCounter = 0;
    enemyCountMax = 0;
    selectedMap = chapter.map;
    gameScreen = "game";
    storyObjectiveComplete = false;
    Map();
    beginStoryStage();
}
function beginStoryStage() {
    const stage = storyChapters[storyChapter].stages[storyStage];
    clearDialogue();
    captureProgress = 0;
    captureLastUpdate = Date.now();
    if (stage.map && selectedMap !== stage.map) {
        selectedMap = stage.map;
        Map();
        const player = balls.find(b => b.isPlayer);
        if (!player) return;
        player.x = mapSpawns[selectedMap]?.player[0] || canvas.width / 2;
        player.y = mapSpawns[selectedMap]?.player[1] || canvas.height / 2;
        player.dx = 0;
        player.dy = 0;
    }
    for (const [speaker, text] of stage.dialogue) {
        showDialogue(text, speaker, commanderImage, true);
    }
    const player = balls.find(b => b.isPlayer);
    if (player) player.health = player.maxHealth;
    storyPhase = "dialogue";
}
function finishStoryChapter(){
    quitGame();
    gameScreen = "chapterSelect";
}
function updateStory(){
    if (gameMode !== "story") return;
    const chapter = storyChapters[storyChapter];
    const stage = chapter.stages[storyStage];
    const dialogueDone = !currentDialogue && dialogueQueue.length === 0;

    if (storyPhase === "dialogue" && dialogueDone) {
        if(stage.objective?.type === "capture") {
            storyPhase = "capture";
            enemyCounter = 0;
            enemyCountMax = stage.enemies.length;
            for (const weapon of stage.enemies) {
                spawnEnemy(weapon, pickEnemySpawn());
            }
        } else if (stage.objective?.type === "collect") {
            objects = objects.filter(obj => obj.type !== "keycard");
            objects.push(new Object("keycard", 650, 500));
            storyPhase = "collect";
        } else if (stage.objective?.type === "airstrike") {
            storyPhase = "airstrike";
            startAirstrike(stage.objective.duration);
        } else if (stage.objective?.type === "talk") {
            storyPhase = "talk";
            captureProgress = 0;
            captureLastUpdate = Date.now();
            enemyCounter = 0;
            enemyCountMax = stage.enemies.length;
            for (const weapon of stage.enemies) {
                spawnEnemy(weapon, pickEnemySpawn());
            }
        }
        else {

        enemyCountMax = stage.enemies.length;
        storyPhase = "fight";

        for (const weapon of stage.enemies) {
            spawnEnemy(weapon, pickEnemySpawn());
        }
    }
    } else if (storyPhase === "capture") {
        const player = balls.find(b => b.isPlayer);
        const now = Date.now();
        if(player){
            const distance = Math.hypot(
                player.x - stage.objective.x,
                player.y - stage.objective.y
            );
            if (distance <= stage.objective.radius) {
                captureProgress += Math.min((now - captureLastUpdate) / 1000, 0.05);
            } else {
                captureProgress = 0
            }
            captureLastUpdate = now;
            if(captureProgress >= stage.objective.duration) {
                storyPhase = "fight";
                enemyCounter = 0;
            }
        }
    } else if (storyPhase === "talk") {
        const player = balls.find(b => b.isPlayer);
        const researcher = balls.find(b => b.isEnemy && b.weapon === "Researcher");
        const now = Date.now();
        if (!researcher) {
            spawnEnemy("Researcher", pickEnemySpawn());
            showDialogue("Stop shooting! We need him alive...", "Commander", commanderImage, true);
            return;
        }
        if (player && researcher) {
            const distance = Math.hypot(player.x - researcher.x, player.y - researcher.y);
            if (distance <= stage.objective.radius) {
                captureProgress += Math.min((now - captureLastUpdate) / 1000, 0.05);
            } else {
                captureProgress = Math.max(0, captureProgress - Math.min((now - captureLastUpdate) / 1000, 0.05));
            }
            captureLastUpdate = now;
            
            const ratio = captureProgress / stage.objective.duration;
            if (ratio >= 0.25 && !researcher.talk1) {
                researcher.talk1 = true;
                showDialogue("Please, I can help you! I know their plans!", "Researcher", null, true);
            } else if (ratio >= 0.5 && !researcher.talk2) {
                researcher.talk2 = true;
                showDialogue("I can tell you where their base is!", "Researcher", null, true);
            } else if (ratio >= 0.75 && !researcher.talk3) {
                researcher.talk3 = true;
                showDialogue("The mutated monster is in the next room here!", "Researcher", null, true);
            }
            if (captureProgress >= stage.objective.duration) {
                researcher.remove = true;
                enemyCounter = 0;
                storyPhase = "fight";
            }
        }
    }
        else if (storyPhase === "collect" && storyObjectiveComplete) {
    money += stage.reward;
    storyStage++;

    if (storyStage >= chapter.stages.length) {
        storyPhase = "outro";
        clearDialogue();

        for (const [speaker, text] of chapter.outro[0].dialogue) {
            showDialogue(text, speaker, commanderImage, true);
        }

        selectedMap = chapter.outro[0].map;
        Map();
    } 
    else {
        beginStoryStage();
    }
} else if (storyPhase === "airstrike") {
        if (updateAirstrike()) {
            endAirstrike();
            money+= stage.reward;
            storyStage++;
            if (storyStage >= chapter.stages.length) {
                clearDialogue();
                for (const [speaker, text] of chapter.outro[0].dialogue) {
                    showDialogue(text, speaker, commanderImage, true);
                }
                selectedMap = chapter.outro[0].map;
                Map();
                const player = balls.find(b => b.isPlayer);
                if (!player) return;
                player.x = mapSpawns[selectedMap]?.player[0] || canvas.width / 2;
                player.y = mapSpawns[selectedMap]?.player[1] || canvas.height / 2;
                player.dx = 0;
                player.dy = 0;
                storyPhase = "outro";
            } else {
                beginStoryStage();
            }
    }
}
        else if (storyPhase === "fight" && enemyCounter <= 0){
            money+= stage.reward;
            storyStage++;
            if(storyStage >= chapter.stages.length){
                clearDialogue();
                for (const [speaker, text] of chapter.outro[0].dialogue) {
                    showDialogue(text, speaker, commanderImage, true);
                }
                selectedMap = chapter.outro[0].map;
                Map();
                const player = balls.find(b => b.isPlayer);
                if (!player) return;
                player.x = mapSpawns[selectedMap]?.player[0] || canvas.width / 2;
                player.y = mapSpawns[selectedMap]?.player[1] || canvas.height / 2;
                player.dx = 0;
                player.dy = 0;
                storyPhase = "outro";
            }
            else{
                beginStoryStage();
            }
        }
            else if (storyPhase === "outro" && dialogueDone){
                finishStoryChapter();
                return;
            }
        }
    

function addCombo(){
    combo++;
    comboTimer = Date.now() + 5000;
}
const abilities = [
    {name: "Grenade", cooldown: 8000, lastUsed:-Infinity},
    {name: "Speed", cooldown: 5000, lastUsed:-Infinity}
]
let abilityKey = [false,false];
let grenades = [];
let speedBoost = 0;

function useAbility(index, player){
    const ability = abilities[index];
    if (Date.now() - ability.lastUsed >= ability.cooldown) {
        ability.lastUsed = Date.now();
        if (ability.name === "Grenade") {
            const angle = Math.atan2(mouseY - player.y, mouseX - player.x);
            grenades.push({x: player.x, y: player.y, dx: Math.cos(angle) * 5, dy: Math.sin(angle) * 5, explodeAt: Date.now() + 2000, done: false});
        } else if (ability.name === "Speed") {
            speedBoost = Date.now() + 5000;
        }
    }
}

function updateAbilities(player){
    ctx.globalAlpha = 1;

    for (const g of grenades) {
        g.x += g.dx;
        g.y += g.dy;
        g.dx *= 0.92;
        g.dy *= 0.92;
        if (Date.now() > g.explodeAt) {
            createExplosion(g.x, g.y,100,80);
            g.done = true;
        } else {
            ctx.beginPath();
            ctx.arc(g.x, g.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = "green";
            ctx.fill();
        }
    }
    grenades = grenades.filter(g => !g.done);    
}

function drawAbilityBar() {
    const w = 90
    const h = 50;
    const gap = 10;
    const startX = canvas.width /2 - (abilities.length * w + (abilities.length - 1) * gap) / 2;
    const y = canvas.height - 70;
    for (let i = 0; i < abilities.length; i++) {
        const x = startX + i * (w + gap);
        ctx.fillStyle = "gray";
        ctx.fillRect(x, y, w, h);
        const left = abilities[i].cooldown - (Date.now() - abilities[i].lastUsed);
        if (left > 0) {
            ctx.fillStyle = "rgba(0,0,0,0.6)";
            ctx.fillRect(x + w - w * left / abilities[i].cooldown, y, w * left / abilities[i].cooldown, h);
        }
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.fillText(abilities[i].name, x + w / 2, y + h / 2 - 10);
        ctx.fillText(i + 1, x + w / 2, y + h / 2 + 10);
    }
}
BackgroundImage = new Image();
let stats = {
    speed: 1,
    health: 100,
    damage: 10,
    fireRate: 1,
    armor: 0
}
let binds = {
    up: "w",
    down: "s",
    left: "a",
    right: "d",
    shoot: "f",
    melee: "g",
    dodge: "control",
    speed: "shift",
    menu: "m",
    shop: "n",
    health: "h",
    ability: "t",
    ability1: "1",
    ability2: "2"
}

const bindNames = [
    ["up","Move up"],
    ["down","Move down"],
    ["left","Move left"],
    ["right","Move right"],
    ["shoot","Shoot"],
    ["melee","Melee attack"],
    ["dodge","Dodge"],
    ["speed","Sprint"],
    ["menu","Open menu"],
    ["shop","Open shop"],
    ["health","Toggle health bars"],
    ["ability","Use ability"],
    ["ability1","Use ability 1"],
    ["ability2","Use ability 2"]
]
let rebinding = null;

const bindButtons = {};

const spawnProtectionMs = 1000;
function isInvulnerable(ball) {
    return Date.now() < (ball.invulnerableUntil || 0);
}
let currentCategory = "Guns";
/*
plans (not implemented yet):
add powerups: health, speed, damage, armor

for menu:
add < > to switch between categories in shop,
also if theres more than 1 page of whatever

for mobile: add touch controls and improve shooting, draggable aim?

for gameplay: add random events (2x money multiplier?) --> use for crates? csgo style (also maybe for skins, accessories, etc)
add sound

add skill tree (upgrades)

add tutorial (IMPORTANT!!!)

other fun options: 2 player in 1 device mode?
map creation? (will need export/import)

planned: combo key, t + 1,2,3,4,5 = ability (like grenades and stuff) and it will show [ ] [ ] [ ] [Grenade] [...] when t is held

*/

/*
future story structure:
Raid into enemy base,
find key to room,
open door,
at the end, is the boss, after winning, cutscene (maybe) airstrike the enemy base

story addons:
-Objectives (key, position, doors)
-Enemy spawn positions
-pre shop
-Save data, new currency, story coins?
*/
let balls =[
    { x: canvas.width / 2, y: canvas.height / 2, dx: 0, dy: 0 ,color: "blue",radius: radius,isPlayer: true, health: getMaxHealth(), maxHealth: getMaxHealth(),hit: false, isDead: false, weapon: null, remove: false, ammo: Infinity, isProjectile: false, createdAt: null, following: false, speed: stats.speed, size: 1, dodgeCooldown: 0}
]
let objects = [];
let explosions = [];

document.addEventListener("keydown", (event) => {
    if (gameMode !== "tutorial") return;
    let key = event.key.toLowerCase();

    if (key in tutorialKeysPressed) {
        tutorialKeysPressed[key]++;
    }
});

window.addEventListener("keydown", (e) => {
    if (e.repeat || gameScreen !== "game" || rebinding) return;
    const k = e.key.toLowerCase();
    if (k === "escape" || k === "p") {
        canvas.style.cursor = "default"
        if (paused) resumeGame();
        else pauseGame();
    }
});

function setTutorialStep(step) {
    if (tutorialStep === step && tutorialStep != 0) return;

    tutorialStep = step;
    clearDialogue();
    showDialogue(tutorialTexts[step], "Commander", commanderImage, false);
    tutorialKeysPressed = {
        w: 0,
        a: 0,
        s: 0,
        d: 0,
    };

    if (step === 5) {
        tutorialShots = 0;
    }

    if (step === 6) {
    tutorialMelee = 0;
    }
}
function drawTutorialArrow() {
    if (gameMode !== "tutorial") return;
    let targetX=null;
    let targetY=null;
    let txt="";
    let txt2="";
    if (tutorialStep === 0) {
        const player = balls.find(ball => ball.isPlayer);
        if (!player) return;
        targetX = player.x;
        targetY = player.y;
        txt="Press WASD";
        let remainingKeys = [];
        if (tutorialKeysPressed["w"] === 0) remainingKeys.push("W");
        if (tutorialKeysPressed["a"] === 0) remainingKeys.push("A");
        if (tutorialKeysPressed["s"] === 0) remainingKeys.push("S");
        if (tutorialKeysPressed["d"] === 0) remainingKeys.push("D");
        txt2 = remainingKeys.join(",");
    }

    else if (tutorialStep === 1) {
        targetX=menubutton.x+menubutton.width/2;
        targetY=menubutton.y+menubutton.height/2;
        txt="Click the Menu button";
    }

    else if (tutorialStep === 2) {
        targetX=buttonshop.x+buttonshop.width/2;
        targetY=buttonshop.y+buttonshop.height/2;
        txt="Click the Shop button";
    }
    else if (tutorialStep === 3) {
        targetX=shopmenu.x+shopmenu.width/2;
        targetY=shopmenu.y;
        menu.visible = false;
        txt="Drag the Shop menu";
    }
    else if (tutorialStep === 4) {
        if (currentCategory !== "Skins") {
            targetX = buttonshopSkins.x + buttonshopSkins.width / 2;
            targetY = buttonshopSkins.y + buttonshopSkins.height / 2;
            txt = "Press the Skins category";
        } else {
            const accessoryButton = itemButtons.find(
                entry => accessories.includes(entry.item.name) && (entry.item.price ?? 0) === 0
            );
            if (accessoryButton) {
                targetX = accessoryButton.button.x + accessoryButton.button.width / 2;
                targetY = accessoryButton.button.y + accessoryButton.button.height / 2;
                txt = "Buy an accessory";
                txt2 = "Press the accessory button";
            }
        }
    }

    else if (tutorialStep === 5) {
        const player = balls.find(ball => ball.isPlayer);
        if (!player) return;
        targetX = player.x;
        targetY = player.y;
        txt="Press 'F' to shoot";
        shopmenu.visible = false;
        txt2="";
    }
    else if (tutorialStep === 6) {
        const player = balls.find(ball => ball.isPlayer);
        if (!player) return;
        targetX = player.x;
        targetY = player.y;
        txt="Press 'G' to melee attack";
    }

    else if (tutorialStep === 7) {
        const enemy = balls.find(ball => ball.isEnemy);
        if (!enemy) return;
        targetX = enemy.x;
        targetY = enemy.y;
        txt="Kill the enemy";
    }

    if(targetX === null && targetY === null){
        return;
    }

    drawArrow(targetX+40, targetY-40, targetX, targetY, "Orange",txt,txt2);
}

function updateTutorial() {
    if (gameMode !== "tutorial") return;

    if (tutorialStep === 0) {
        if (
            tutorialKeysPressed["w"] > 0 &&
            tutorialKeysPressed["a"] > 0 &&
            tutorialKeysPressed["s"] > 0 &&
            tutorialKeysPressed["d"] > 0
        ) {
            setTutorialStep(1);
        }
    }
    else if (tutorialStep === 1) {
        if (menu.visible) {
            setTutorialStep(2);
        }
    }
    else if (tutorialStep === 2) {
        if (shopmenu.visible) {
            showCategory(currentCategory);
            tutorialShopStartX = shopmenu.x;
            tutorialShopStartY = shopmenu.y;
            tutorialShopMoved = false;
            setTutorialStep(3);
        }
    }
    else if (tutorialStep === 3) {
        if (
            Math.abs(shopmenu.x - tutorialShopStartX) > 30 ||
            Math.abs(shopmenu.y - tutorialShopStartY) > 30
        ) {
            tutorialShopMoved = true;
        }

        if (tutorialShopMoved && !shopmenu.dragging) {
            setTutorialStep(4);
        }
    }
    else if (tutorialStep === 4) {
        if (tutorialAccessoryBought) {
            setTutorialStep(5);
        }
    }
    else if (tutorialStep === 5) {
        if (tutorialShots >= 3) {
            setTutorialStep(6);
        }
    }
    else if (tutorialStep === 6) {
        if (tutorialMelee >= 3) {
            setTutorialStep(7);
            spawnEnemy("Katana");
        }
    }
    else if (tutorialStep === 7) {
    if (enemyCounter === 0) {
        gameMode = null;
        const player = balls.find(ball => ball.isPlayer);
        money=0;
        player.health = getMaxHealth();
        if (!player) return;
        player.x=canvas.width / 2;
        player.y=canvas.height / 2;
        gameScreen = "mainMenu";
    }
}

}

function drawTutorialShotProgress() {
    if (gameMode !== "tutorial" || tutorialStep !== 5) return;
    const player = balls.find(ball => ball.isPlayer);
    if (!player) return;
    ctx.fillStyle = isDarkMode ? "white" : "black";
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`Shots: ${tutorialShots}`, 10, 130);
    
    for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(player.x - 50 + i * 50,player.y + 50, 12, 0, Math.PI * 2);
        ctx.fillStyle = i < tutorialShots ? "green" : "gray";
        ctx.fill();
        ctx.restore();
    }
}

function drawTutorialMeleeProgress() {
    if (gameMode !== "tutorial" || tutorialStep !== 6) return;
    const player = balls.find(ball => ball.isPlayer);
    if (!player) return;
    ctx.save();
    ctx.fillStyle = isDarkMode ? "white" : "black";
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`Melee: ${tutorialMelee}`, 10, 130);
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(player.x - 50 + i * 50,player.y + 50, 12, 0, Math.PI * 2);
        ctx.fillStyle = i < tutorialMelee ? "green" : "gray";
        ctx.fill();
    }
    ctx.restore();
}

window.addEventListener("keydown", (event)=>{
    if (rebinding) {
        const k = event.key.toLowerCase();
        if (k !== "escape") {
            for (const [a] of bindNames) {
                if (binds[a] === k) binds[a] = binds[rebinding];
            }
            binds[rebinding] = k;
        }
        rebinding = null;
        updateBindText();
        keys = {};
        event.preventDefault();
        return;
    }
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
        ctx.save();
        ctx.globalAlpha = this.transparency;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'black';
        let size = 16;
        do { ctx.font = `${size--}px Arial`; }
        while (ctx.measureText(this.text).width > this.width - 10 && size > 9);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = this.transparency;
        ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = .5;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        if (mouseDown && mouseX >= this.x && mouseX <= this.x + this.width && mouseY >= this.y && mouseY <= this.y + this.height) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeStyle = 'rgba(189, 180, 180, 0.68)';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
        if (mouseX >= this.x && mouseX <= this.x + this.width && mouseY >= this.y && mouseY <= this.y + this.height) {
            ctx.fillStyle = 'rgba(130, 124, 124, 0.1)';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeStyle = 'rgba(233, 226, 226, 0.88)';
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
        ctx.restore();
    }
    isPressed() {
        return justClicked&& mouseX >= this.x && mouseX <= this.x + this.width && mouseY >= this.y && mouseY <= this.y + this.height;
    }
}

class Frame {
    constructor(x, y, width, height, color,transparency,ball,hasTitleBar=false,title='Frame') {
        this.title = title;
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
        ctx.save();
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
        this.title,
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
        ctx.restore();
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
function drawHUD(player) {
    const x = 10, y = 10, w = 180, h = 16;
    const ratio = Math.max(0, player.health / player.maxHealth);
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = ratio > 0.5 ? '#4caf50' : ratio > 0.25 ? '#e0a800' : '#d32f2f';
    ctx.fillRect(x, y, w * ratio, h);
    ctx.strokeStyle = isDarkMode ? 'white' : 'black';
    ctx.strokeRect(x, y, w, h);
    ctx.lineWidth = 1;
    ctx.fillStyle = isDarkMode ? '#fffefe' : '#000000';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const lines = [`Money: ${money}`, `Deaths: ${deaths}`];
    if (gameMode === 'wave' || gameMode === 'endless') {
        lines.push(`Wave: ${wave}`);
        lines.push(`Enemies: ${enemyCounter}/${enemyCountMax}`);
    }
    const ammo = currentWeapon.ammo === Infinity ? 'Inf' : currentWeapon.ammo;
    lines.push(`${currentWeapon.name} equipped`);
    lines.push(`Ammo: ${ammo}`);
    lines.forEach((text, i) => ctx.fillText(text, x, y + h + 8 + i * 18));
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.ceil(player.health)}/${player.maxHealth}`, x + w / 2, y + h / 2);
    ctx.restore();
}
function drawChapterSelect() {
    ctx.fillStyle = isDarkMode ? "#2b2828" : "white";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Story Mode", canvas.width / 2, 80);
    for (const b of chapterSelectButtons) b.draw(ctx);

    if (justClicked) {
        if (chapterSelectButtons[0].isPressed()) {
            startStoryChapter(1);
        } else if (chapterSelectButtons[1].isPressed()) {
            startStoryChapter(2);
        } else if (chapterSelectButtons[2].isPressed()) {
            startStoryChapter(3);
        } else if (chapterSelectButtons[3].isPressed()) {
            startStoryChapter(4);
        }
    else if (chapterSelectButtons[4].isPressed()) {
            gameScreen = "modeSelect";
        }
        justClicked = false;
    }
}
function drawCrossHair() {
    const overUI = getTopFrameAtMouse() !== null ||
        (mouseX >= menubutton.x && mouseX <= menubutton.x + menubutton.width &&
         mouseY >= menubutton.y && mouseY <= menubutton.y + menubutton.height);
    if (overUI) return;
    canvas.style.cursor = "none";
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 2;
    ctx.shadowColor = "black";
    ctx.shadowBlur = 2;
    ctx.beginPath();
    for (const [dx, dy] of [[1,0], [-1,0], [0,1], [0,-1]]) {
        ctx.moveTo(mouseX + dx * 10, mouseY + dy * 10);
        ctx.lineTo(mouseX + dx * 20, mouseY + dy * 20);
    }
    ctx.stroke();
    ctx.restore();
}

const modeSelectButtons = [
    new Button(300, 200, 200, 50, "Sandbox Mode", "lightblue", 0.5),
    new Button(300, 300, 200, 50, "5 Waves Mode", "lightblue", 0.5),
    new Button(100, 450, 100,50, "Normal Mode", "yellow", 0.5),
    new Button(100, 550, 100, 50, "Hard Mode", "red", 0.5), 
    new Button(100, 350, 100, 50, "Endless Mode", "lightblue", 0.5),
    new Button(300, 400, 200, 50, "Back", "lightblue", 0.5),
    new Button(550, 275, 100, 100, "Tutorial", "blue", 0.5),
    new Button(550, 400, 100, 100, "Story Mode", "orange", 0.5)
]
const chapterSelectButtons = [
    new Button(300,150, 200, 50, "Chapter 1", "lightblue", 0.5),
    new Button(300, 200, 200, 50, "Chapter 2", "lightblue", 0.5),
    new Button(300, 250, 200, 50, "Chapter 3", "lightblue", 0.5),
    new Button(550, 150, 200, 50, "Chapter 4", "lightblue", 0.5),
    new Button(300, 300, 200, 50, "Back", "lightblue", 0.5),]
const mapSelectButtons = [
    new Button(300, 100, 200, 50, "Default Map", "lightblue", 0.5),
    new Button(300, 200, 200, 50, "Map 1", "lightblue", 0.5),
    new Button(300, 300, 200, 50, "Map 2", "lightblue", 0.5),
    new Button(300, 400, 200, 50, "Map 3", "lightblue", 0.5),
    new Button(300, 500, 200, 50, "Back", "lightblue", 0.5)
]
let upgradeButtons = [
    new Button( 150,300, 150, 100, "Increase HP", "lightgreen", 0.75),
    new Button( 325,300, 150, 100, "Increase Speed", "lightgreen", 0.75),
    new Button( 500,300, 150, 100, "Increase Damage", "lightgreen", 0.75)
];
const enemyStats = {
    "Katana": {
        health: 50,
        speed: 1,
        damage: 5,
        shootDelay: 0,
        size:1
    },
    "Nodachi": {
        health: 100,
        speed: 0.5,
        damage: 10,
        shootDelay: 0,
        size:1
    },
    "Dragon Slayer": {
        health: 150,
        speed: 0.2,
        damage: 200,
        shootDelay: 0,
        size:2.5
    },
    "Pistol": {
        health: 20,
        speed: .8,
        damage: 5,
        shootDelay: 500,
        size:1
    },
    "Shotgun": {
        health: 30,
        speed: 0.75,
        damage: 10,
        shootDelay: 1000,
        size:1
    },
    "Sniper": {
        health: 40,
        speed: 0.1,
        damage: 80,
        shootDelay: 1500,
        size:1
    },
    "Explosive Sniper": {
        health: 10,
        speed: 0,
        damage: 200,
        shootDelay: 2000,
        size:1
    },
    "Medic": {
        health: 25,
        speed: 0.6,
        damage: 0,
        size: 1
    },
    "Shielder": {
        health: 300,
        speed: 0.25,
        damage: 10,
        shootDelay: 0,
        size:1
    },
    "Researcher": {
        health: 500,
        speed: 0.95,
        damage: 0,
        shootDelay: 0,
        size: 1
    }

}
function checkShieldBreak(enemy) {
    if (enemy.shielded && enemy.health <= 0) {
        enemy.shielded = false;
        enemy.maxHealth = 50;
        enemy.health = 50;
        if(enemy.accessory === "Shield") enemy.accessory=null;
    }
}
function healEnemies(medic){
    if (medic.isDead || medic.remove) return;
    for (const enemy of balls) {
        if (!enemy.isEnemy || enemy === medic || enemy.isDead || enemy.remove) continue;

        const dx = enemy.x - medic.x;
        const dy = enemy.y - medic.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 125 && enemy.health < enemy.maxHealth) {
            enemy.health = Math.min(enemy.maxHealth, enemy.health + 0.15);
        }
    }
}
const keepDistance = {
    "Pistol": 100,
    "Shotgun": 50,
    "Sniper": 200,
    "Dual Wield": 75,
    "Explosive Sniper": 150,
    "Medic": 125,
    "Researcher": 800
}

function drawArrow(x1, y1, x2, y2, color,txt,txt2){
    let head = 12;
    let angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.fillStyle = !isDarkMode ? "#e8c411" : "white";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(txt, x1 + (x2 - x1) / 2, y1 + (y2 - y1) / 2 - 60);
    ctx.fillText(txt2, x1 + (x2 - x1) / 2, y1 + (y2 - y1) / 2 + 60);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x2 - head * Math.cos(angle - Math.PI / 6), y2 - head * Math.sin(angle - Math.PI / 6));

    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - head * Math.cos(angle + Math.PI / 6), y2 - head * Math.sin(angle + Math.PI / 6));

    ctx.strokeStyle = color;
    ctx.lineWidth = 7;
    ctx.globalAlpha = 1;
    ctx.stroke();
    ctx.restore();
}

function spawnEnemy(weapon, pos=null) {
    const stats = enemyStats[weapon] || enemyStats["Katana"];
    enemyCounter++;
    balls.push({
        x: pos ? pos[0] : 100,
        y: pos ? pos[1] : 100,
        dx: 0,
        dy: 0,
        color: weapon === "Medic" ? "limegreen" : (weapon === "Researcher" ? "plum" : "red"),
        radius: radius,
        health: stats.health,
        speed: stats.speed,
        damage: stats.damage,
        shootDelay: stats.shootDelay,
        size: stats.size,
        maxHealth: stats.health,
        hit: false,
        isDead: false,
        isEnemy: true,
        following: true,
        strafe: true,
        stuckTimer: 0,
        weapon: weapon,
        accessory: enemyAccessories[weapon] || null,
        shielded: weapon === "Shielder"
    });
}
function repeat(item, count) {
    return Array(count).fill(item);
}
const waveConfigs = {
    easy: [
        ["Katana", "Katana"],
        ["Pistol", "Katana", "Katana", "Katana"],
        ["Pistol", "Pistol", "Pistol", "Katana", "Katana"],
        ["Shotgun", "Sniper", "Pistol", "Katana", "Katana", "Katana", "Katana", "Katana", "Katana", "Katana", "Shielder"],
        ["Dragon Slayer", "Sniper", "Sniper", "Medic"]
    ],
    normal: [
        [...repeat("Katana", 2)],
        [...repeat("Katana", 3)],
        ["Pistol", "Katana"],
        [...repeat("Pistol", 2), ...repeat("Katana", 2)],
        ["Shotgun", "Nodachi", "Shielder"],
        ["Sniper", ...repeat("Katana", 5)],
        ["Sniper", "Shotgun", "Pistol", "Katana", "Nodachi"],
        [...repeat("Sniper", 2), ...repeat("Shotgun", 2), ...repeat("Pistol", 2)],
        ["Dragon Slayer", ...repeat("Nodachi", 5)],
        ["Medic", ...repeat("Sniper", 5), ...repeat("Pistol", 2), "Shielder"],
        ["Medic", ...repeat("Katana", 15), ...repeat("Pistol", 5), "Shielder"],
        [...repeat("Medic", 2),...repeat("Shielder", 2), "Dragon Slayer", ...repeat("Sniper", 2), ...repeat("Shotgun", 2), ...repeat("Pistol", 2)],
        [...repeat("Medic", 2),...repeat("Shielder", 2),...repeat("Dragon Slayer", 2)],
        [...repeat("Medic", 2),...repeat("Shielder", 2),...repeat("Dragon Slayer", 3), ...repeat("Sniper", 5), ...repeat("Shotgun", 5), ...repeat("Pistol", 5), ...repeat("Katana", 9)]
    ],
    hard: [
        [...repeat("Katana", 5)],
        [...repeat("Katana", 2), ...repeat("Pistol", 2)],
        [...repeat("Shotgun", 2), ...repeat("Pistol", 2)],
        [...repeat("Sniper", 2), ...repeat("Shotgun", 2), ...repeat("Pistol", 2)],
        [...repeat("Sniper", 2), "Dragon Slayer", ...repeat("Nodachi", 2), "Shielder"],
        [...repeat("Sniper", 5), ...repeat("Nodachi", 5)],
        [...repeat("Shotgun", 10)],
        ["Medic", ...repeat("Dragon Slayer", 3)],
        [...repeat("Medic", 2),...repeat("Shielder", 2),"Dragon Slayer", ...repeat("Pistol", 5), ...repeat("Shotgun", 5), "Sniper"],
        [...repeat("Medic", 2),...repeat("Shielder", 2),...repeat("Dragon Slayer", 2), ...repeat("Sniper", 5), ...repeat("Shotgun", 5)],
        [...repeat("Medic", 2),...repeat("Shielder", 2),...repeat("Dragon Slayer", 5)],
        [...repeat("Medic", 2),...repeat("Shielder", 2),...repeat("Dragon Slayer", 3), ...repeat("Sniper", 5), ...repeat("Shotgun", 5), ...repeat("Pistol", 5), ...repeat("Nodachi", 5), ...repeat("Katana", 5)],
        [...repeat("Medic", 2),...repeat("Shielder", 2),...repeat("Sniper", 10)],
        [...repeat("Medic", 2),...repeat("Shielder", 2),...repeat("Sniper", 10), ...repeat("Shotgun", 10)],
        [...repeat("Medic", 3),...repeat("Shielder", 3), ...repeat("Dragon Slayer", 10), ...repeat("Sniper", 10)]
    ]
};

function startWave(waveNumber) {
    const modeWaves = waveConfigs[waveDifficulty];
    if (!modeWaves) return;
    const config = modeWaves[waveNumber - 1];
    if (!config) return;

    enemyCounter = 0;
    enemyCountMax = config.length;
    bossFightActive = (waveNumber === 5 || config.includes("Dragon Slayer"));

    for (const weapon of config) {
        spawnEnemy(weapon);
    }
    waveStart = false;
}

function generateEndlessWave(waveNumber) {
    const enemies = [];
    const count = 3 + Math.floor(waveNumber * 1.1);
    const types = ["Katana", "Pistol", "Shotgun", "Nodachi", "Sniper", "Dragon Slayer"];

    for (let i = 0; i < count; i++) {
        let max = Math.min(types.length - 1, Math.floor(waveNumber / 3));
        enemies.push(types[Math.floor(Math.random() * (max + 1))]);
    }

    if (waveNumber % 5 === 0) {
        enemies.push("Dragon Slayer");
    }

    return enemies;
}

function startEndlessWave(waveNumber) {
    const config = generateEndlessWave(waveNumber);
    enemyCounter = 0;
    enemyCountMax = config.length;
    bossFightActive = (waveNumber % 5 === 0);
    for (const weapon of config) {
        spawnEnemy(weapon);
    }
    waveStart = false;
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
            gameScreen = "mapSelect";
            gameMode = "sandbox";
            money = 999999;
            shopFree = true;
        } else if (modeSelectButtons[1].isPressed()) {
            balls = balls.filter(ball => ball.isPlayer);
            wave = 1;
            waveDifficulty = "easy";
            shopFree = false;
            startWave(1);
            gameScreen = "mapSelect";
            gameMode = "wave";
        } 
        else if (modeSelectButtons[2].isPressed()) {
            balls = balls.filter(ball => ball.isPlayer);
            wave = 1;
            waveDifficulty = "normal";
            shopFree = false;
            startWave(1);
            gameScreen = "mapSelect";
            gameMode = "wave";
        } else if (modeSelectButtons[3].isPressed()) {
            balls = balls.filter(ball => ball.isPlayer);
            wave = 1;
            waveDifficulty = "hard";
            shopFree = false;
            startWave(1);
            gameScreen = "mapSelect";
            gameMode = "wave";
            
        }
        else if (modeSelectButtons[4].isPressed()) {
            balls = balls.filter(ball => ball.isPlayer);
            shopFree = false;
            wave = 1;
            startEndlessWave(1);
            gameScreen = "mapSelect";
            gameMode = "endless";
        }
        else if (modeSelectButtons[5].isPressed()) {
            gameScreen = "mainMenu";
        } else if (modeSelectButtons[6].isPressed()) {
            shopFree = true;
            tutorialStep = 0;
            gameMode = "tutorial";
            gameScreen = "mapSelect";
            setTutorialStep(0)
        }
        else if (modeSelectButtons[7].isPressed()) {
            gameScreen = "chapterSelect";
        }
    }
}

function drawMapSelect() {
    ctx.fillStyle = isDarkMode ? "#2b2828" : "white";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Select Map", canvas.width / 2, 100);
    for (const button of mapSelectButtons) {
        button.draw(ctx);
    }

    if(justClicked){
        if (mapSelectButtons[0].isPressed()) {
            selectedMap = "default";
            gameScreen = "game";
            Map();
        } 
        else if (mapSelectButtons[1].isPressed()) {
            selectedMap = "map1";
            gameScreen = "game";
            Map();
        }
        else if (mapSelectButtons[2].isPressed()) {
            selectedMap = "map2";
            gameScreen = "game";
            Map();
        }
        else if (mapSelectButtons[3].isPressed()) {
            selectedMap = "map3";
            gameScreen = "game";
            Map();
        }
        else if (mapSelectButtons[4].isPressed()) {
            gameScreen = "mainMenu";
        }
    }
}
class Object {
    constructor(type, x = null, y = null) {
        if (type === "heal") {
            this.x = Math.random() * (canvas.width - 20) + 10;
            this.y = Math.random() * (canvas.height - 20) + 10;
            this.width = 20;
            this.height = 20;
            this.radius = 10;
            this.size=1;
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
            this.size = 1;
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
            this.size=1;
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
            this.size=1;
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
        if (type === "ammo") {
            this.x = x !== null ? x : Math.random() * (canvas.width - 20) + 10;
            this.y = y !== null ? y : Math.random() * (canvas.height - 20) + 10;
            this.width = 20;
            this.height = 20;
            this.radius = 10;
            this.size = 1;
            this.color = "green";
            this.type = "ammo";
            this.healAmount = 0;
            this.ammoAmount = 10;
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 3;
            this.dx = Math.cos(angle) * speed;
            this.dy = Math.sin(angle) * speed;

            this.scale = .2;
            this.startTime = performance.now();
            this.duration = 1000;
        }
        if (type === "coin") {
            this.x = x !== null ? x : Math.random() * (canvas.width - 20) + 10;
            this.y = y !== null ? y : Math.random() * (canvas.height - 20) + 10;
            this.width = 20;
            this.height = 20;
            this.radius = 10;
            this.size = 1;
            this.color = "yellow";
            this.type = "coin";
            this.healAmount = 0;
            this.ammoAmount = 0;
            this.coinAmount = 1;
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 3;
            this.dx = Math.cos(angle) * speed;
            this.dy = Math.sin(angle) * speed;

            this.scale = .2;
            this.startTime = performance.now();
            this.duration = 1000;
        }
        if (type === "keycard") {
            this.x = x;
            this.y = y;
            this.width = 20;
            this.height = 20;
            this.radius = 10;
            this.size = 1;
            this.color = "cyan";
            this.type = "keycard";
            this.healAmount = 0;

            this.scale = 1;
            this.startTime = performance.now();
            this.duration = 1000;
        }
    }
    update(){
        const elapsed = performance.now() - this.startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        if (this.type === "ammo" || this.type ==="coin") {
            this.scale = 0.2 + eased * 0.8;
            this.x += this.dx;
            this.y += this.dy;
            this.dx *= 0.9;
            this.dy *= 0.9;
            this.x = Math.max(10, Math.min(canvas.width - 10 - this.width, this.x));
            this.y = Math.max(10, Math.min(canvas.height - 10 - this.height, this.y));
        } else {
            this.scale = 3 - eased * 2;
        }
        
        
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
        } else if (this.type === "keycard") {
            r = 100;
            g = 100;
            b = 255;
        }
        if (this.type !== "ammo" && this.type !== "coin" && this.type !== "keycard") {
        this.color = `rgb(
            ${Math.round(r * eased)},
            ${Math.round(g * eased)},
            ${Math.round(b * eased)}
        )`;
        }
    }
     draw(ctx) {
        if (this.type !== "ammo" && this.type !== "coin" && this.type !== "keycard") {
        this.update();
        const width = this.width * this.scale;
        const height = this.height * this.scale;
        const x = this.x + (this.width - width) / 2;
        const y = this.y + (this.height - height) / 2;
        
        ctx.fillStyle = this.color;
        ctx.fillRect(x, y, width, height);
    }
    else if (this.type === "ammo" || this.type === "coin") {
        this.update();
        const width = this.width * this.scale;
        const height = this.height * this.scale;
        const x = this.x + (this.width - width) / 2;
        const y = this.y + (this.height - height) / 2;

        ctx.fillStyle = this.color;
        ctx.fillRect(x, y, width, height);
    }   
        else if (this.type === "keycard") {
            this.update();
            const width = this.width * this.scale;
            const height = this.height * this.scale;
            const x = this.x + (this.width - width) / 2;
            const y = this.y + (this.height - height) / 2;

            ctx.globalAlpha = 1;
            ctx.fillStyle = this.color;
            ctx.fillRect(x, y, width, height);
    }
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
        if(this.name==="AK47"){
            this.x=0;
            this.y=-10;
            this.width=60;
            this.height=10+20;
            this.angle=0;
            this.lastShot=0;
            this.offsetX=10;
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
        if (this.name === "Shotgun") {
            playShootSound(shootSound3);
        } else if (this.name === "Sniper" || this.name === "Explosive Sniper") {
            playShootSound(shootSound2);
        } else {
            playShootSound(shootSound);
        }
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
                size: 1,
                isProjectile: true,
                createdAt: Date.now(),
                damage: this.damage * (player.isPlayer ? (stats.damage / 10) : 1),

                isExplosive: this.explosive,
                explosionRadius: this.explosionRadius,
                explosionDamage: this.explosionDamage * (player.isPlayer ? (stats.damage / 10) : 1),
            })
        }

        return projectiles;
    }
    
    
}

let soundEnabled = true;

const shootSound = new Audio("assets/shot2.mp3");
const shootSound2 = new Audio("assets/snipershot.mp3");
const shootSound3 = new Audio("assets/shotgunshot.mp3");
let masterVolume = 1;
shootSound.volume = 0.15;
shootSound2.volume = 0.15;
shootSound3.volume = 0.15;
const sliceSound = new Audio("assets/swing.mp3");
sliceSound.volume = 0.35;
function playShootSound(sound){
    if (!soundEnabled) return;
    const s = sound.cloneNode();
    s.volume = sound.volume*masterVolume;
    s.play().catch(() => {});
}
function playSliceSound(){
    if (!soundEnabled) return;
    const s = sliceSound.cloneNode();
    s.volume = sliceSound.volume*masterVolume;
    s.play().catch(() => {});
}
function playSound() {
    const audio = new AudioContext();
    const oscillator = audio.createOscillator();
    const gain= audio.createGain();

    oscillator.type = 'square';
    oscillator.frequency.value=100;
    gain.gain.value=0.1*masterVolume;
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
        if (gameMode === "tutorial" && tutorialStep === 6) {
            tutorialMelee++;
        }
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
        if(progress<0.1){
            playSliceSound();
        }

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

                if (distanceSq <= enemy.radius * enemy.size * enemy.radius * enemy.size) {                    
                    this.hitEnemies.add(enemy);
                    enemy.health -= this.damage * (player.isPlayer ? (stats.damage / 10) : 1);
                    enemy.color = enemy.weapon === "Medic" ? "lightgreen" : "lightcoral";
                    checkShieldBreak(enemy);
                    if(enemy.health <= 0){
                        addCombo();
                        enemy.isDead = true;
                        enemy.transparency = 0.95;
                        enemy.dx=0;
                        enemy.dy=0;
                        if (Math.random() <0.3){
                            objects.push(new Object("ammo", enemy.x, enemy.y));
                        } else if (Math.random() > 0.5){
                            objects.push(new Object("coin", enemy.x, enemy.y));
                        }
                        setTimeout(() => {
                            enemy.remove = true;
                            money+= 10;
                            if(gameMode==="wave"||gameMode==="tutorial"||gameMode==="endless"||gameMode==="story"){
                                enemyCounter--;
                            }
                        }, 1000);
                    }
                    else {
                        setTimeout(() => {
                            if (!enemy.isDead) {
                                enemy.color = enemy.weapon === "Medic" ? "limegreen" : "red";
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
function enemyMelee(enemy){
    const enemyMeleeWeapons = {
        "Katana": 55,
        "Nodachi": 95,
        "Dragon Slayer": 140
    };
    const range = enemyMeleeWeapons[enemy.weapon];
    if (!range|| !enemy.isEnemy || enemy.isDead || enemy.remove) {
        return;
    }
    const player = balls.find(ball => ball.isPlayer);
    if (!player || player.isDead || player.remove) {
        return;
    }
    const now = Date.now();
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (!enemy.meleeSwinging && distance <= range) {
        enemy.meleeSwinging = true;
        enemy.meleeStart = now;
        enemy.hitPlayer = false;
        playSliceSound();
    }
    if (enemy.swinging) {
        if (!enemy.hitPlayer && distance <= range && !enemy.hitPlayer && progress >= 0.2) {
            enemy.hitPlayer = true;
            if (!isInvulnerable(player)) {
                player.health = Math.max(0, player.health - enemy.damage);
                player.color = "lightblue";
                setTimeout(() => {
                    if (!player.isDead) player.color = "blue";
                }, 200);

                if (player.health <= 0) {
                    combo = 0;
                    player.isDead = true;
                    player.transparency = 0.95;
                    setTimeout(() => {
                        player.isDead = false;
                        player.health = player.maxHealth;
                        player.x = canvas.width / 2;
                        player.y = canvas.height / 2;
                        player.dx = 0;
                        player.dy = 0;
                        player.color = "blue";
                        player.invulnerableUntil = Date.now() + spawnProtectionMs;
                    }, 2000);
                }
            }
        }
        if (progress >= 1) {
            enemy.meleeSwinging = false;
            enemy.nextSwing = now + (enemy.weapon === "Dragon Slayer" ? 1100 : 600);
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
        const player = balls.find(ball => ball.isPlayer);
        if (player.isDead) enemy.swingStart = 0;
        else if (["Katana", "Nodachi", "Dragon Slayer"].includes(enemy.weapon)) {
            if (!enemy.swingStart && Math.hypot(player.x - enemy.x, player.y - enemy.y) <= 100) {
                enemy.swingStart = Date.now();
                playSliceSound();
            }
            if (enemy.swingStart) {
                const progress = (Date.now() - enemy.swingStart) / 300;
                if (progress < 1) ctx.rotate((Math.PI / 3) * (1 - progress * 2));
                else if (progress > 2) enemy.swingStart = 0;
            }
        }
        ctx.rotate(Math.atan2(player.y - enemy.y, player.x - enemy.x));
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
        
        if (distance <= radius + enemy.radius * enemy.size) {
            enemy.health -= damage;
            enemy.color = "orange";
            checkShieldBreak(enemy);
            if (enemy.health <= 0) {
                addCombo();
                enemy.isDead = true;
                enemy.transparency = 0.95;
                enemy.dx = 0;
                enemy.dy = 0;
                if (Math.random() <0.3){
                    objects.push(new Object("ammo", enemy.x, enemy.y));
                }
                setTimeout(() => {
                    if (!enemy.remove) {
                        enemy.remove = true;
                        money += 10;
                        if (gameMode === "wave" || gameMode === "tutorial" || gameMode === "endless"|| gameMode === "story") {
                            enemyCounter--;
                        }
                        
                    }
                }, 800);
            } else {
                setTimeout(() => {
                    if (!enemy.isDead) {
                        enemy.color = enemy.weapon === "Medic" ? "limegreen" : "red";
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
                player.invulnerableUntil = Date.now() + spawnProtectionMs;
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
const floors = [];
const sandbags = [];
let wallsVisible = false;
let bossFightActive = false;

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
function drawTiled(ctx, image, x, y, width, height) {
    if (!image.complete || image.naturalWidth === 0) return;
    const tile = Math.min(100, width, height);
    const s = tile / 100;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.fillStyle = ctx.createPattern(image, "repeat");
    ctx.fillRect(0, 0, width / s, height / s);
    ctx.restore();
}

function addWall(img, x, y, width, height, bullets = "deflect") {
    walls.push(new Wall(x, y, width, height, {
        bulletBehavior: bullets, solid: true, image: img, tile: true
    }));
}
function addProp(img, x, y, w, h, bullets = "destroy") {
    walls.push(new Wall(x, y, w, h, {
        bulletBehavior: bullets, solid: true, image: img, tile: false
    }));
}
class Wall {
    constructor(x, y, width = 100, height = 20, options = {}) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.bulletBehavior = options.bulletBehavior || "deflect";
        this.solid = options.solid ?? true;
        this.bosswall = options.bosswall ?? false;
        this.image = options.image || wallImage;
        this.tile = options.tile ?? false;
    }

    draw(ctx) {
        if (this.image.complete && this.image.naturalWidth > 0) {
            if (this.tile) drawTiled(ctx, this.image, this.x, this.y, this.width, this.height);
            else {}
            ctx.drawImage(
                this.image,
                this.x,
                this.y,
                this.width,
                this.height
            );
        }
        }
    }


class Sandbag {
    constructor(x,y, width =80, height = 80) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw(ctx) {
        if (sandbagImage.complete && sandbagImage.naturalWidth > 0) {
            ctx.drawImage(
                sandbagImage,
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
            if (!wall.solid||wallsVisible===false||(bossFightActive && wall.bosswall)) {
                continue;
            }
            const closestX = Math.max(wall.x, Math.min(ball.x, wall.x + wall.width));
            const closestY = Math.max(wall.y, Math.min(ball.y, wall.y + wall.height));
            let dx= ball.x - closestX;
            let dy= ball.y - closestY;
            const distanceSq = dx * dx + dy * dy;

            if (distanceSq >=ball.radius * ball.radius * ball.size * ball.size) continue;
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

                    const sideDistance = Math.sqrt(nx * nx + ny * ny);

                    if (sideDistance > 0) {
                        nx = nx / sideDistance;
                        ny = ny / sideDistance;
                    }
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
            const penetrationDepth = ball.radius * ball.size - distance;

            ball.x += nx * penetrationDepth;
            ball.y += ny * penetrationDepth;

            if (!ball.isProjectile) {
                const dot = ball.dx * nx + ball.dy * ny;

                if (dot < 0) {
                    ball.dx -= dot * nx;
                    ball.dy -= dot * ny;
                }
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
class Floor {
    constructor(x, y, width = 100, height = 100, image = floorImage) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = image;
    }

    draw(ctx) {
        if (this.image.complete && floorImage.naturalWidth > 0) {
            ctx.drawImage(
                this.image,
                this.x,
                this.y,
                this.width,
                this.height
            );
        }
    }
}


function Map() {
    bushes.length = 0;
    trees.length = 0;
    walls.length = 0;
    floors.length = 0;
    sandbags.length = 0;

    BackgroundImage = new Image();
    bossFightActive = false;
    if (selectedMap === "default") {
        bushes.push(new Bush(150, 200));
        bushes.push(new Bush(400, 300));
        bushes.push(new Bush(600, 150));

        trees.push(new Tree(500, 450));

        walls.push(new Wall(700,500, 200,20, { bulletBehavior: "deflect", solid: true }));

        walls.push(new Wall(0,500, 200,20, { bulletBehavior: "destroy", solid: true }));

        walls.push(new Wall(700, 100, 10, 200, { bulletBehavior: "penetrate", solid: true }));
}
    if (selectedMap === "map1") {
        wallsVisible = true;
        walls.push(new Wall(0,500, 200,20, { bulletBehavior: "destroy", solid: true }));
        walls.push(new Wall(0,300, 20,200, { bulletBehavior: "destroy", solid: true }));
        walls.push(new Wall(0,300, 200,20, { bulletBehavior: "destroy", solid: true }));
        walls.push(new Wall(200,300, 20,50, { bulletBehavior: "destroy", solid: true }));
        walls.push(new Wall(200,470, 20,50, { bulletBehavior: "destroy", solid: true }));
        walls.push(new Wall(450,350, 20,150, { bulletBehavior: "deflect", solid: true }));
        walls.push(new Wall(550,550, 200,20, { bulletBehavior: "deflect", solid: true }));
        walls.push(new Wall(550,200, 20,100, { bulletBehavior: "deflect", solid: true}));
        walls.push(new Wall(550,300, 200,20, { bulletBehavior: "deflect", solid: true}));
        walls.push(new Wall(200,125, 20,75, { bulletBehavior: "deflect", solid: true}));
        trees.push(new Tree(550, 325));
        bushes.push(new Bush(250,300));
        bushes.push(new Bush(250,470));
    }
    if (selectedMap === "map2") {
        wallsVisible = true;
        BackgroundImage.src = "assets/map2.png";
        walls.push(new Wall(300,500, 75,20, { bulletBehavior: "destroy", solid: true, bosswall: true}));
        walls.push(new Wall(450,500, 75,20, { bulletBehavior: "destroy", solid: true, bosswall: true}));
        walls.push(new Wall(300,300, 20,200, { bulletBehavior: "destroy", solid: true }));
        walls.push(new Wall(500,300, 20,200, { bulletBehavior: "destroy", solid: true }));
        floors.push(new Floor(300, 300, 220, 200));
        floors.push(new Floor(355, 250, 100, 50));
        walls.push(new Wall(300,300, 75,20, { bulletBehavior: "destroy", solid: true, bosswall: true}));
        walls.push(new Wall(450,300, 75,20, { bulletBehavior: "destroy", solid: true, bosswall: true}));
        walls.push(new Wall(355,250, 20,50, { bulletBehavior: "destroy", solid: true, bosswall: true}));
        walls.push(new Wall(450,250, 20,50, { bulletBehavior: "destroy", solid: true, bosswall: true}));
        walls.push(new Wall(375,250, 75,20, { bulletBehavior: "destroy", solid: true, bosswall: true}));
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                trees.push(new Tree(0 + i * 120 + Math.random() * 200, 0 + j * 120+ Math.random() * 200));
                bushes.push(new Bush(0 + i * 120 + Math.random() * 200, 0 + j * 120+ Math.random() * 200));
            }
        }
    }
    if (selectedMap === "map3") {
        wallsVisible = true;
        floors.push(new Floor(0, 0, canvas.width, canvas.height, sandFloorImage));
        floors.push(new Floor(200, 150, 400, 300, floorImage));
        sandbags.push(new Sandbag(360, 280, 80, 35));
        sandbags.push(new Sandbag(100, 250, 35, 80));
        sandbags.push(new Sandbag(665, 250, 35, 80));
        walls.push(new Wall(200, 150, 400, 20, { bulletBehavior: "deflect", solid: true, image: greenWallImage }));
        walls.push(new Wall(200, 150, 20, 300, { bulletBehavior: "deflect", solid: true, image: greenWallImage }));
        walls.push(new Wall(580, 150, 20, 300, { bulletBehavior: "deflect", solid: true, image: greenWallImage }));
        walls.push(new Wall(200, 450, 140, 20, { bulletBehavior: "deflect", solid: true, image: greenWallImage }));
        walls.push(new Wall(460, 450, 140, 20, { bulletBehavior: "deflect", solid: true, image: greenWallImage }));
        for (let i = 0; i < 5; i++) {
            objects.push(new Object("mine"));
            objects.push(new Object("rock"));
        }
    }
    if (selectedMap === "map4") {
        wallsVisible = true;
        floors.push(new Floor(0, 0, canvas.width, canvas.height, sandFloorImage));
        floors.push(new Floor(340, 0, 120, 600, road));
        addProp(crate,650, 300, 50, 50);
        addWall(fence, 230, 120, 80, 20, "penetrate");
        addWall(fence, 490, 120, 80, 20, "penetrate");
        sandbags.push(new Sandbag(360, 280, 80, 35));
        sandbags.push(new Sandbag(100, 250, 35, 80));
        sandbags.push(new Sandbag(665, 250, 35, 80));
    }
    if (selectedMap === "map4p2") {
        wallsVisible = true;
        floors.push(new Floor(0, 0, canvas.width, canvas.height, sandFloorImage));
        floors.push(new Floor(340, 300, 120, 300, road));
        addWall(concrete, 200, 0, 400, 300);
        addProp(door, 350, 200, 100, 100, "deflect");
        addWall(fence, 0, 200, 200, 20, "penetrate");
        addWall(fence, 600, 200, 200, 20, "penetrate");
        addProp(crate, 130, 420, 50, 50);
        addProp(crate, 620, 430, 50, 50);
        sandbags.push(new Sandbag(360, 280, 80, 35));
        sandbags.push(new Sandbag(100, 250, 35, 80));
        sandbags.push(new Sandbag(665, 250, 35, 80));

    }
    if (selectedMap === "map5") {
        wallsVisible = true;
        floors.push(new Floor(0, 0, 800, 600, metal));
        addWall(concrete, 200, 150, 400, 20);
        addWall(concrete, 200, 150, 20, 300);
        addWall(concrete, 580, 150, 20, 300);
        addWall(concrete, 0, 450, 50, 20);
        addWall(concrete, 150, 450, 190, 20);
        addWall(concrete, 580, 450, 140, 20);
        addProp(crate, 235, 185, 50, 50);
        addProp(crate, 515, 185, 50, 50);
        addProp(crate, 235, 385, 50, 50);
        addProp(crate, 515, 385, 50, 50);
        addProp(crate, 60, 300, 50, 50);
        addProp(crate, 700, 250, 50, 50);
        addProp(server, 330, 175, 60, 60);
        addProp(server, 430, 175, 60, 60);
    }
    if (selectedMap === "map5u") {
        wallsVisible = true;
        floors.push(new Floor(0, 0, 800, 600, metal));
        addWall(concrete, 0, 190, 800, 20);
        addWall(concrete, 0, 390, 800, 20);
        addProp(crate, 320, 230, 50, 50);
        addProp(crate, 480, 320, 50, 50);
    }
    if (selectedMap === "map5p2") {
        wallsVisible = true;
        floors.push(new Floor(0, 0, 800, 600, metal));
        addWall(concrete, 150, 100, 20, 140);
        addWall(concrete, 150, 360, 20, 140);
        addWall(concrete, 630, 100, 20, 140);
        addWall(concrete, 630, 360, 20, 140);
        addWall(fence, 150, 240, 20, 120, "penetrate");
        addWall(fence, 630, 240, 20, 120, "penetrate");
        addProp(server, 660, 120, 60, 60);
        addProp(server, 720, 120, 60, 60);
        addProp(server, 660, 410, 60, 60);
        addProp(server, 720, 410, 60, 60);
        addProp(crate, 250, 100, 50, 50);
        addProp(crate, 500, 100, 50, 50);
        addProp(crate, 250, 450, 50, 50);
        addProp(crate, 500, 450, 50, 50);
    }
    if (selectedMap === "map5p3") {
        wallsVisible = true;
        floors.push(new Floor(0, 0, 800, 600, metal));

        addWall(concrete, 150, 100, 500, 20);
        addWall(concrete, 150, 100, 20, 400);
        addWall(concrete, 630, 100, 20, 400);
        addWall(concrete, 150, 480, 200, 20);
        addWall(concrete, 450, 480, 200, 20);
        addWall(concrete, 480, 120, 20, 60);
        addWall(concrete, 500, 260, 130, 20);

        addProp(crate, 220, 180, 50, 50);
        addProp(crate, 300, 380, 50, 50);
        addProp(crate, 540, 380, 50, 50);
    }

    if (selectedMap === "map5p4") {
        wallsVisible = true;
        floors.push(new Floor(0, 0, 800, 600, metal));

        addWall(concrete, 150, 150, 500, 20);
        addWall(concrete, 150, 430, 500, 20);

        addProp(server, 250, 250, 60, 60);
        addProp(server, 500, 250, 60, 60);
    }

    if (selectedMap === "map5p5") {
        wallsVisible = true;
        floors.push(new Floor(0, 0, 800, 600, metal));

        addWall(concrete, 200, 100, 20, 400);
        addWall(concrete, 580, 100, 20, 400);

        addProp(crate, 300, 200, 50, 50);
        addProp(crate, 450, 350, 50, 50);
    }

    if (selectedMap === "map5p6") {
        wallsVisible = true;
        floors.push(new Floor(0, 0, 800, 600, metal));

        addWall(concrete, 380, 100, 40, 170);
        addWall(concrete, 380, 330, 40, 170);

        addProp(server, 250, 200, 60, 60);
        addProp(server, 500, 350, 60, 60);
    }
    if (selectedMap === "map6") {
        wallsVisible = true;
        floors.push(new Floor(0, 0, 800, 600, sandFloorImage));
        floors.push(new Floor(340, 0, 120, 600, road));
        addWall(concrete, 150, 120, 100, 20);
        addWall(concrete, 150, 120, 20, 70);
        addWall(concrete, 550, 120, 100, 20);
        addWall(concrete, 630, 120, 20 ,70);
        addWall(concrete, 150, 420, 100, 20);
        addWall(concrete, 630, 420, 20 ,70);
        addProp(crate, 260, 300, 50, 50);
        addProp(crate, 490, 240, 50, 50);
        sandbags.push(new Sandbag(100, 250, 35, 80));
        sandbags.push(new Sandbag(665, 250, 35, 80));
    }
    if (selectedMap === "map6p2") {
        wallsVisible = true;
        floors.push(new Floor(0, 0, 800, 600, sandFloorImage));
        addWall(concrete, 250, 80, 20, 180);
        addWall(concrete, 250, 340, 20, 180);
        addWall(concrete, 520, 160, 20, 280);
        addWall(fence, 270, 260, 80, 20, "penetrate");
        addProp(crate, 500, 100, 50, 50);
        addProp(crate, 380, 450, 50, 50);
        addProp(crate, 60, 500, 50, 50);
        sandbags.push(new Sandbag(120, 150, 35, 80));
    }
    if (selectedMap === "map6p3") {
        wallsVisible = true;
        floors.push(new Floor(0, 0, 800, 600, sandFloorImage));
        addWall(concrete, 200, 0, 20, 400);
        addWall(concrete, 580, 0, 20, 400);
        addWall(concrete, 200, 480, 120, 20);
        addWall(concrete, 580, 480, 120, 20);
        addProp(crate, 320, 250, 50, 50);
        addProp(crate, 440, 150, 50, 50);
        addProp(crate, 360, 400, 50, 50);
    }
    if (selectedMap === "map6p4") {
        wallsVisible = true;
        floors.push(new Floor(0, 0, 800, 600, sandFloorImage));
        addWall(concrete, 250, 40, 300, 150);
        addProp(door, 350, 190, 100, 40, "deflect");
        addWall(fence, 0, 300 , 200, 20, "penetrate");
        addProp(crate, 560, 380, 50, 50);
        addProp(crate, 720, 400, 50, 50);
        addProp(crate, 120, 450, 50, 50);
        sandbags.push(new Sandbag(300, 400, 80, 35));
    }
    if (selectedMap === "map7"){
        wallsVisible = true;
        floors.push(new Floor(0, 0, 800, 600, metal));
        floors.push(new Floor(0, 0, 800, 600, metal));
        addWall(concrete, 120, 0, 20, 300);
        addWall(concrete, 660, 0, 20, 300);
        addWall(concrete, 280, 250, 20, 150);
        addWall(concrete, 500, 250, 20, 150);
        addProp(crate, 380, 330, 50, 50);
        addProp(crate, 200, 420, 50, 50);
        addProp(crate, 560, 420, 50, 50);
    }
    if (selectedMap === "map7p2"){
        wallsVisible = true;
        floors.push(new Floor(0, 0, 800, 600, metal));
        addProp(server, 150, 180, 60, 60);
        addProp(server, 210, 180, 60, 60);
        addProp(server, 530, 180, 60, 60);
        addProp(server, 590, 180, 60, 60);
        addProp(server, 150, 340, 60, 60);
        addProp(server, 210, 340, 60, 60);
        addProp(server, 530, 340, 60, 60);
        addProp(server, 590, 340, 60, 60);
        addWall(concrete, 370, 220, 60, 20);
        addWall(concrete, 370, 360, 60, 20);
    }
    if (selectedMap === "map7p3"){
        wallsVisible = true;
        floors.push(new Floor(0, 0, 800, 600, metal));
        addWall(concrete, 0, 140, 350, 20);
        addProp(door, 350, 130, 100, 40, "deflect");
        addWall(concrete, 450, 140, 350, 20);
        addProp(crate, 200, 200, 50, 50);
        addProp(crate, 550, 200, 50, 50);
        addProp(crate, 200, 400, 50, 50);
        addProp(crate, 550, 400, 50, 50);
    }
    if (selectedMap === "map7p4"){
        wallsVisible = true;
        floors.push(new Floor(0, 0, 800, 600, metal));
        addWall(concrete, 0,170, 800, 20);
        addWall(concrete, 0, 410, 800, 20);
        addProp(crate, 200, 250, 50, 50);
        addProp(crate, 550, 250, 50, 50);
        addProp(crate, 200, 350, 50, 50);
        addProp(crate, 550, 350, 50, 50);
    }
    if (selectedMap === "map7p5"){
        wallsVisible = true;
        floors.push(new Floor(0, 0, 800, 600, metal));
        addWall(concrete, 0, 250, 120, 20);
        addProp(door, 120, 240, 100, 40, "deflect");
        addWall(concrete, 220, 250, 100, 20);
        addWall(concrete, 480, 250, 100, 20);
        addProp(door, 580, 240, 100, 40, "deflect");
        addWall(concrete, 680, 250, 120, 20);
        addWall(concrete, 300, 40, 20, 210);
        addWall(concrete, 480, 40, 20, 210);
        addProp(server, 680, 80, 60, 60);
        addProp(server, 680, 80, 60, 60);
        addProp(crate, 150, 400, 50, 50);
        addProp(crate, 600, 400, 50, 50);
    }
    if (selectedMap === "map7p6"){
        wallsVisible = true;
        floors.push(new Floor(0, 0, 800, 600, metal));
        addProp(server, 130, 130, 60, 60);
        addProp(server, 610, 130, 60, 60);
        addProp(server, 130, 410, 60, 60);
        addProp(server, 610, 410, 60, 60);
        addProp(crate, 375, 275, 50, 50);
        addProp(monster, 375, 100, 150, 150);
    }
}

const mapSpawns = {
    map4: { player: [canvas.width/2, canvas.height/2], enemies: [[300,50], [400, 50], [500, 50]]},
    map4p2: { player: [400,350], enemies: [[60,540], [740, 540], [400, 570]]},
    map5u: { player: [400,250], enemies: [[700,250], [800, 250], [600, 250]]},
    map5p3:{ player: [575,130], enemies: [[700,200], [700, 400], [700, 300]]},
    map5p4: { player: [400, 540]},
    map5p5: { player: [400, 540], enemies: [[300,50], [400, 50], [500, 50]]},
    map5p6: { player: [80, 300], enemies: [[700,200], [700, 400], [700, 300]]},
    map6: { player: [400, 300]},
    map6p2: { player: [80, 300], enemies: [[700,100], [700, 500]]},
    map6p3: { player: [400, 540]},
    map6p4: { player: [100, 400]},
    map7: { player: [400, 80],  enemies: [[100,500], [700,500], [400,560]] },
    map7p2: { player: [400, 540], enemies: [[100,80], [700,80], [400,60]] },
    map7p3: { player: [400, 540], enemies: [[60,540], [740,540], [100,300], [700,300]] },
    map7p4: { player: [60, 300],  enemies: [[740, 300]] },
    map7p5: { player: [400, 540], enemies: [[400,120]]},
    map7p6: { player: [400, 540], enemies: [[400, 80]] },
}
function pickEnemySpawn() {
    const list = mapSpawns[selectedMap]?.enemies;
    if (!list || list.length === 0) return null;
    const [x, y] = list[Math.floor(Math.random() * list.length)];
    return [x + (Math.random() - 0.5) * 24, y + (Math.random() - 0.5) * 24];
}
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
    DualWield: new Gun("Dual Wield", 8, 5, Infinity),
    AK47: new Gun("AK47", 12, 5, 300, 7, 1, 0.1)
};

const shopItems = {
    Guns: [
        { name: "Pistol", price: 0, oneTime: true,action: () => currentWeapon = weapons.Pistol },
        { name: "Shotgun", price: 10, oneTime: true,action: () => currentWeapon = weapons.Shotgun },
        { name: "Sniper", price: 20, oneTime: true,action: () => currentWeapon = weapons.Sniper },
        { name: "Explosive Sniper", price: 60, oneTime: true,action: () => currentWeapon = weapons.ExplosiveSniper },
        { name: "Dual Wield", price: 40, oneTime: true,action: () => currentWeapon = weapons.DualWield },
        { name: "AK47", price: 50, oneTime: true,action: () => currentWeapon = weapons.AK47 },
        { name: "Katana", price: 0, oneTime: true,action: () => currentMelee= katana },
        { name: "Nodachi", price: 10, oneTime: true,action: () => currentMelee= nodachi },
        { name: "Dragon Slayer", price: 20, oneTime: true,action: () => currentMelee= dragonslayer },
    ],

    Utility: [
        { name: "Heal Package", price: 1, oneTime: false, action: () => objects.push(new Object("heal")) },
        { name: "Big Rock", price: 2, oneTime: false, action: () => objects.push(new Object("rock")) },
        { name: "Speed Boost", price: 3, oneTime: false, action: () => objects.push(new Object("speedboost")) },
        { name: "Mine", price: 4, oneTime: false, action: () => objects.push(new Object("mine")) }
    ],
    Skins: [
        { name: "Red Ball", price: 0, oneTime: true, action: () => balls[0].color = "red" },
        { name: "Blue Ball", price: 0, oneTime: true, action: () => balls[0].color = "blue" },
        ...accessories.map(name => ({ name,price: name=== "Crown" ? 10 : 0, oneTime: true, action: () => wearAccessory(name)})),
        { name: "Green Ball", price: 0, oneTime: true, action: () => balls[0].color = "green" },
        { name: "Yellow Ball", price: 0, oneTime: true, action: () => balls[0].color = "yellow" },
    ],
    Armor: [
        { name: "Leather Armor", price: 5, oneTime: true, action: () => equipArmor(5, "Leather Armor") },
        { name: "Iron Armor", price: 10, oneTime: true, action: () => equipArmor(10, "Iron Armor") },
        { name: "Gold Armor", price: 15, oneTime: true, action: () => equipArmor(15, "Gold Armor") },
        { name: "Cool Armor", price: 20, oneTime: true, action: () => equipArmor(20, "Cool Armor") }
    ]
};

function getMaxHealth() {
    return stats.health + stats.armor * 5;
}

function wearAccessory(accessoryName) {
    const player = balls.find(ball => ball.isPlayer);
    if (!player) return;
    player.accessory = accessoryName;
}

function drawEnemyHat(enemy) {
    if (!enemy.isEnemy || enemy.remove || !enemy.accessory) return;
    const image = accessoryImages[enemy.accessory];
    if (!image || !image.complete || image.naturalWidth === 0) return;
    
    let width = enemy.radius * enemy.size *2;
    let height = enemy.radius * enemy.size *2;
    let x = enemy.x - enemy.radius * enemy.size;
    let y = enemy.y - enemy.radius * enemy.size;

    if(enemy.accessory === "Glasses"){
        width= enemy.radius*2;
        height= enemy.radius*2;
    }
    if(enemy.accessory === "Top Hat"){
        y=enemy.y - enemy.radius-25;
        width= enemy.radius*2;
        height= enemy.radius*2;
    }
    if(enemy.accessory === "Crown"){
        y=enemy.y - enemy.radius-90;
        width= enemy.radius*5;
        height= enemy.radius*5;
    }
    if(enemy.accessory === "Monocle"){
        width= enemy.radius*2;
        height= enemy.radius*2;
    }
    if(enemy.accessory === "Shield"){
        width= enemy.radius*3;
        height= enemy.radius*3;
    }
    ctx.drawImage(image, x, y, width, height);
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


function buyItem(item) {
    const cost = shopFree ? 0 : item.price ?? 0;

    if (item.oneTime && Owned.includes(item.name)) {
        item.action();
        showCategory(currentCategory);
        return;
    }

    if (money >= cost) {
        money -= cost;
        if (item.oneTime) {
            Owned.push(item.name);
        }
        item.action();
        showCategory(currentCategory);
    } else {
        playSound();
    }
}
function drawEnemyHealthBar(enemy) {
    if(!showEnemyHealthbars || !enemy.isEnemy || enemy.isDead || enemy.remove) return;
    
    const barWidth = enemy.radius * 2;
    const barHeight = 5;
    const barX = enemy.x - barWidth / 2;
    const barY = enemy.y - enemy.radius - 10;

    ctx.fillStyle = "red";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    ctx.fillStyle = enemy.shielded ? "yellow" : "green";
    ctx.fillRect(barX, barY, barWidth * (enemy.health / enemy.maxHealth), barHeight);
}

function pauseGame() {
    paused = true;
    pausedImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    pauseMenu.visible = true;
    keys = {};
}

function resumeGame() {
    paused = false;
    pausedImage = null;
    pauseMenu.visible = false;
    keys = {};
    clickedFrame = null;
}

function quitGame() {
    resumeGame();
    balls = balls.filter(ball => ball.isPlayer);
    const player = balls[0];
    player.health = player.maxHealth;
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.dx = 0;
    player.dy = 0;
    player.isDead = false;

    objects = [];
    explosions = [];
    grenades = [];
    rebinding = null;
    speedBoost = 0;
    combo = 0;
    comboTimer = 0;
    for (const a of abilities) a.lastUsed = -Infinity;
    menu.visible = false;
    shopmenu.visible = false;
    skinsmenu.visible = false;
    settings.visible = false;
    keybindsmenu.visible = false;

    enemyCounter = 0;
    wave = 1;
    money = 0;
    waveIndicator = null;
    showUpgradePrompt = false;
    gameMode = null;
    gameScreen = "mainMenu";
    clearDialogue();
}

function updateBindText(){
    for (const [key, name] of bindNames) {
        if (rebinding === key) {
            bindButtons[key].text = name + ": ...";
        } else {
            bindButtons[key].text = name + ": " + binds[key].toUpperCase();
        }
    }
}

const info = new Frame(
    50, 50, 150, 70, "lightblue", 0, null, false, "Info"
);
const infotext1 = new Text(
    60, 60, "Ammo: Infinity", isDarkMode ? "#fffefe" : "#000000", 14
);
const infotext2 = new Text(
    60, 80, `Health: ${getMaxHealth()}`, isDarkMode ? "#fffefe" : "#000000", 14
);
info.addText(infotext1);
info.addText(infotext2);
const pauseMenu = new Frame(
    250, 250, 300, 250, "lightgray", 0.5, null, false, "Pause Menu"
);
const pauseMenuButton1 = new Button(
    300, 300, 200, 50, "Resume Game", "lightgreen", 0.5
);
const pauseMenuButton2 = new Button(
    300, 360, 200, 50, "Quit Game", "lightcoral", 0.5
);
pauseMenu.addButton(pauseMenuButton2);
pauseMenu.addButton(pauseMenuButton1);
const mainmenu = new Frame(
    250, 250, 300, 250, "lightgray", 0.5, null, false, "Main Menu"
);
const mainmenuButton1 = new Button(
    300, 300, 200, 50, "Start Game", "lightgreen", 0.5
);


const menubutton = new Button(
    25, 300, 50, 50, "Menu", "lightgreen", 1
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
    250, 250, 300, 250, "lightgray", 0.5, null, true, "Menu"
);

const settings = new Frame(
    400, 400, 300, 250, "darkgray", 0.5, null, true, "Settings"
);
const keybindsButton = new Button(
    610, 550, 90, 50, "Keybinds", "lightgray", 0.5
);
const globalStopFollow = new Button(
    265, 345, 130, 40, "Stop Follow", "red", 0.5
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
const volDown = new Button(
    610, 500, 40, 50, "-", "lightgray", 0.5
);
const volUp = new Button(
    655, 500, 40, 50, "+", "lightgray", 0.5
);
const volText = new Text(
    610, 460, "Vol: 100%", "black", 14
);

const keybindsmenu = new Frame(
    200, 120, 400, 340, "lightgray", 0.5, null, true, "Keybinds"
);
for (let i=0; i<bindNames.length; i++) {
    const [key, name] = bindNames[i];
    const button = new Button(
        keybindsmenu.x + 10 + Math.floor(i / 7) * 195,
        keybindsmenu.y + 45 + (i % 7) * 40,
        185, 32, name, "lightgray", 0.5
    );
    keybindsmenu.addButton(button);
    bindButtons[key] = button;
}
updateBindText();


const button = new Button(
    265, 295, 130, 40, "Move Ball", "darkgray", 0.5
);

const button2 = new Button(
    405, 295, 130, 40, "Stop Ball", "darkgray", 0.5
);

const button3 = new Button(
    265, 445, 270, 40, "Add Moving Ball", "darkblue", 0.5
);
//plan: remodel this into inventory/clothing/wardrobe type
const button4 = new Button(
    265, 395, 130, 40, "Skins inventory", "lightyellow", 0.5
);

const buttonshop = new Button(
    405, 395, 130, 40, "Shop", "lightgreen", 0.5
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

const shopNextButton = new Button(
    650, 650, 50, 50, "Next", "lightgray", 0.5
);
const shopPrevButton = new Button(
    600, 650, 50, 50, "Prev", "lightgray", 0.5
);

const shopPageText = new Text(
    475,620, "Page 1/1", "black", 14
);

// const button5 = new Button(
//     500, 500, 50, 50, "red ball", "red", 0.5
// );
// const button6 = new Button(
//     550, 500, 50, 50, "blue ball", "blue", 0.5
// );
// const button7 = new Button(
//     500, 550, 50, 50, "green ball", "green", 0.5
// );
// const button8 = new Button(
//     550, 550, 50, 50, "yellow ball", "yellow", 0.5
// );
const buttonSettings = new Button(
    405, 345, 130, 40, "Settings", "lightgray", 0.5
);

const skinsmenu = new Frame(
    400, 400, 300, 250, "orange", 0.5, null, true, "Skins Menu"

);

const shopmenu = new Frame(
    400, 400, 350, 250, "lightgreen", 0.5, null, true, "Shop Menu"

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
// skinsmenu.addButton(button5);
// skinsmenu.addButton(button6);
// skinsmenu.addButton(button7);
// skinsmenu.addButton(button8);
let inventoryButtons = [];
settings.addButton(bgButton);
settings.addButton(toggleWall);
settings.addButton(toggleSound);
settings.addButton(volDown);
settings.addButton(volUp);
settings.addText(volText);
settings.addButton(keybindsButton);
shopmenu.addButton(buttonshopGun);
shopmenu.addButton(buttonshopUtil);
shopmenu.addButton(buttonshopSkins);
shopmenu.addButton(buttonshopArmor);
shopmenu.addButton(shopNextButton);
shopmenu.addButton(shopPrevButton);
shopmenu.addText(shopPageText);

function showCategory(category) {
    currentCategory = category;

    const items = shopItems[category];
    const totalPages = Math.ceil(items.length / SHOP_ITEMS_PER_PAGE);

    shopPage = Math.max(0, Math.min(shopPage, totalPages - 1));

    shopPageText.text = `Page ${shopPage + 1}/${totalPages}`;

    const pageItems = items.slice(
        shopPage * SHOP_ITEMS_PER_PAGE,
        (shopPage + 1) * SHOP_ITEMS_PER_PAGE
    );

    itemButtons = pageItems.map((item, index) => ({
        item,
        button: new Button(
            shopmenu.x + 10 + (index % 2) * 100,
            shopmenu.y + 80 + Math.floor(index / 2) * 45,
            90,
            35,
            (item.oneTime && Owned.includes(item.name)) ? `${item.name} (Owned)` : `${item.name} $${shopFree ? 0 : (item.price ?? 0)}`,
            (currentWeapon.name === item.name || currentMelee.name === item.name || balls[0].accessory === item.name) ? "lightgreen" : "lightgray",
            1
        )
    }));
}

function updateShopHover() {
    hoveredShopItem = null;

    if (!shopmenu.visible) return;

    for (const entry of itemButtons) {
        const button = entry.button;
        if (
            mouseX >= button.x &&
            mouseX <= button.x + button.width &&
            mouseY >= button.y &&
            mouseY <= button.y + button.height &&
            mouseX >= shopmenu.x &&
            mouseX <= shopmenu.x + shopmenu.width &&
            mouseY >= shopmenu.y &&
            mouseY <= shopmenu.y + shopmenu.height
        ) {
            hoveredShopItem = entry.item;
            break;
        }
    }
}

function drawUpgradePrompt() {
    ctx.fillStyle = isDarkMode ? "#252525" : "#f0f0f0";
    ctx.fillRect(150, 180, 500, 220);
    ctx.fillStyle = isDarkMode ? "white" : "black";
    ctx.font = "bold 22px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Upgrade stats", canvas.width / 2, 200);

    upgradeButtons[0].x = 175;
    upgradeButtons[1].x = 325;
    upgradeButtons[2].x = 475;
    for (const button of upgradeButtons) {
        button.y = 250;
        button.width = 140;
        button.height = 90;
        button.draw(ctx);
    }

    if (justClicked) {
        const player = balls.find(ball => ball.isPlayer);

        if (upgradeButtons[0].isPressed()) {
            stats.health += 25;
            if (player) {
                player.maxHealth = getMaxHealth();
                player.health += 25;
            }
        } else if (upgradeButtons[1].isPressed()) {
            stats.speed *= 1.15;
            if (player) {
                player.speed *= 1.15;
            }
        } else if (upgradeButtons[2].isPressed()) {
            stats.damage *= 1.2;
        } else return;
        showUpgradePrompt = false;
    }
}
function drawWaveIndicator() {
    if (!waveIndicator) return;
    if (waveIndicator.endsAt-Date.now() <= 0) {
        waveIndicator = null;
        return;
    }

    const sec = Math.ceil((waveIndicator.endsAt - Date.now()) / 1000);
    ctx.save();
    ctx.fillStyle = isDarkMode ? "white" : "black";
    ctx.font = "bold 22px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(`Wave ${waveIndicator.wave} - Reward: ${waveIndicator.reward} - ${sec}s`, canvas.width / 2, 100);
    ctx.restore();
}
function drawCaptureProgress(){
        if (gameMode !== "story" || storyPhase !== "capture" && storyPhase !== "talk") return;

    const stage = storyChapters[storyChapter].stages[storyStage];
    if (!stage.objective || stage.objective.type !== "capture") return;

    const progress = Math.min(
        captureProgress / stage.objective.duration,
        1
    );

    const width = 260;
    const height = 18;
    const x = (canvas.width - width) / 2;
    const y = 55;

    ctx.save();
    ctx.fillStyle = "black";
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = "green";
    ctx.fillRect(x, y, width * progress, height);
    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText("Progress", canvas.width / 2, y - 5);

    ctx.restore();
}
function drawCaptureZone(){
    if(gameMode !== "story") return;
    if(storyPhase !== "dialogue" && storyPhase !== "capture" && storyPhase !== "talk") return;

    const stage = storyChapters[storyChapter].stages[storyStage];
    if(!stage.objective|| stage.objective.type !== "capture") return;

    let targetX = stage.objective.x;
    let targetY = stage.objective.y;
    const player = balls.find(b => b.isPlayer);
    const distance = Math.hypot(player.x - targetX, player.y - targetY);
    const inside = distance <= stage.objective.radius;

    let label = "Stand in the circle";
    if (stage.objective.type === "talk"){
        const researcher = balls.find(b => b.isEnemy && b.name === "Researcher");
        if (!researcher) return;
        targetX = researcher.x;
        targetY = researcher.y;
        label = "Talk to the researcher";
    }

    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = inside ? "green" : "red";
    ctx.beginPath();
    ctx.arc(targetX, targetY, stage.objective.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "black";
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(label, targetX, targetY - stage.objective.radius - 10);
    ctx.restore();
}
function drawShopTooltip() {
    if (!shopmenu.visible || !hoveredShopItem) return;
    const item = hoveredShopItem;
    const name = item.name;
    const gun = globalThis.Object.values(weapons).find(w => w.name === name);
    const meleeWeapon = [katana, nodachi, dragonslayer].find(w => w.name === name);
    const x = shopmenu.x + 225;
    const y = shopmenu.y + 55;
    const width = 115;
    const height = 180;
    const img = weaponImages[name] || accessoryImages[name];
    const hasImg = img && img.complete && img.naturalWidth > 0;
    ctx.save();
    ctx.globalAlpha = .75;
    ctx.fillStyle = isDarkMode ? "#252525" : "#f0f0f0";
    ctx.fillRect(x, y, width, height);
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = isDarkMode ? "white" : "black";
    let textY = y + 8;
    const left = x + 7;
    ctx.font = "bold 13px Arial";
    ctx.fillText(name, left, textY, width - 14);
    textY = textY + 22;
    if(hasImg){
        const scale = Math.min(width - 7 / img.naturalWidth, 50 / img.naturalHeight);
        ctx.drawImage(img, left + (width - 14 - img.naturalWidth * scale) / 2, textY + (32 - img.naturalHeight * scale) / 2, img.naturalWidth * scale, img.naturalHeight * scale);
        textY = textY + 32 + 4;
    }
    ctx.font = "11px Arial";
    const description = weaponDescriptions[name] || UtilityDescriptions[name] || AccessoryDescriptions[name] || "";
    const words = description.split(" ");
    let line = "";

    for (const word of words) {
        const testLine = line ? line + " " + word : word;

        if (ctx.measureText(testLine).width > width - 14 && line) {
            ctx.fillText(line, left, textY);
            textY = textY + 13;
            line = word;
        } else {
            line = testLine;
        }
    }
    if (line) {
        ctx.fillText(line, left, textY);
        textY = textY + 20;
    }

    if (gun) {
        ctx.fillText(`Damage: ${gun.damage}`, left, textY);
        textY = textY + 17;
        ctx.fillText(`Rate: ${gun.fireRate}/s`, left, textY);
        textY = textY + 17;
        ctx.fillText(`Ammo: ${gun.ammo === Infinity ? "Inf." : gun.ammo}`, left, textY);
        textY = textY + 17;

        if (gun.projectileSpeed !== undefined) {
            ctx.fillText(`Speed: ${gun.projectileSpeed}`, left, textY);
            textY = textY + 17;
        }
        if (gun.bulletCount !== undefined) {
            ctx.fillText(`Bullets: ${gun.bulletCount}`, left, textY);
        }
    } else if (meleeWeapon) {
        ctx.fillText(`Damage: ${meleeWeapon.damage}`, left, textY);
        textY = textY + 17;
        ctx.fillText(`Range: ${meleeWeapon.range}`, left, textY);
    }
    ctx.restore();
}
showCategory(currentCategory);



let ballFrames = [];
let frameOrder = [menu, skinsmenu, shopmenu, settings, keybindsmenu];
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
            showCategory(currentCategory);
        }
    }

    if (frame === skinsmenu && skinsmenu.visible) {
        const ownedSkins = shopItems.Skins.filter(item => Owned.includes(item.name));

        ctx.save();
        ownedSkins.forEach((item, index) => {
            const button = new Button(
                skinsmenu.x + 20 + (index % 3) * 90,
                skinsmenu.y + 50 + Math.floor(index / 3) * 60,
                80, 50,
                item.name,
                balls[0].accessory === item.name ? "lightgreen" : "lightgray",
                1
            );
            button.draw(ctx);
            if (clickedFrame === skinsmenu && button.isPressed()) {
                item.action();
            }
        });
        ctx.restore();
    }
}


function animate(){
    if (paused) {
        ctx.putImageData(pausedImage, 0, 0);
        pauseMenu.draw(ctx);
        ctx.globalAlpha = 1;

        if (pauseMenuButton1.isPressed()) resumeGame();
        else if (pauseMenuButton2.isPressed()) quitGame();

        justClicked = false;
        requestAnimationFrame(animate);
        return;
    }
    ctx.clearRect(0,0,canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.fillStyle = isDarkMode ? "#2b2828" : "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (gameScreen === "mainMenu") {
        clearDialogue();
        mainmenu.draw(ctx);

    if (mainmenuButton1.isPressed()) {
        gameScreen = "modeSelect";
    }
} else if (gameScreen === "modeSelect") {
    drawModeSelect();
    } 
    else if(gameScreen === "mapSelect"){
        drawMapSelect();
    } 
    else if (gameScreen === "chapterSelect") {
        drawChapterSelect();
    }
    else if (gameScreen === "game") {
    if (BackgroundImage.complete && BackgroundImage.naturalWidth > 0) {
        ctx.drawImage(BackgroundImage, 0, 0, canvas.width, canvas.height);
    }
    bushes.forEach(bush => bush.draw(ctx));
    trees.forEach(tree => tree.draw(ctx));
    floors.forEach(floor => floor.draw(ctx));
    sandbags.forEach(sandbag => sandbag.draw(ctx));

    if (wallsVisible) {
        walls.forEach(wall => {
            if (bossFightActive && wall.bosswall) return;
            wall.draw(ctx);
        });
    }

    ctx.fillStyle = isDarkMode ? "#fffefe" : "#000000";
    ctx.font = "16px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    

    /*notes: will compress this later, but for now, this is fine. I want to make sure the game works first.
    enemies still need properties (health, speed, etc.) balancing for sure needed
    */
    updateTutorial();
    updateStory();
    if (Date.now() > comboTimer) {
        combo=0;
    }

    if (combo > 0) {
    ctx.save();
    ctx.fillStyle = "#dd8513";
    ctx.font = `bold ${16 + Math.max(0, 150 - (Date.now() - (comboTimer)+4700)) / 15}px Arial`;
    ctx.textAlign = "right";
    ctx.fillText(`Combo: ${combo}`, canvas.width - 15, canvas.height - 30);
    ctx.restore();
    }
    if (gameMode === "wave" || gameMode === "endless") {


    const maxWaves = waveConfigs[waveDifficulty] ? waveConfigs[waveDifficulty].length : 5;
    if (!waveStart && enemyCounter <= 0 && (gameMode === "endless" || wave < maxWaves)) {        
        waveStart = true;
        money += rewards[wave - 1] || 0;
        waveIndicator = {
            wave: wave,
            reward: rewards[wave - 1] || 0,
            endsAt: Date.now() + 5000
        };
        wave++;
        if (wave%2=== 0) {
            showUpgradePrompt = true;
        }

        const player = balls.find(ball => ball.isPlayer);
        if (player) {
            player.health = player.maxHealth;
        }

        const nextWave = wave;
        setTimeout(() => {
            if (gameMode === "wave") {
                startWave(nextWave);
            } else if (gameMode === "endless") {
                startEndlessWave(nextWave);
            }
        }, 5000);
    } else if (!waveStart && enemyCounter <= 0 && gameMode === "wave" && wave>= maxWaves){
        ctx.save()
        ctx.fillStyle = "gold";
        ctx.font = "bold 36px Arial";
        ctx.textAlign = "center";
        ctx.fillText("You Won All Waves!", canvas.width / 2, canvas.height / 2);
        ctx.fillStyle = "black";
        ctx.font = "20px Arial";
        ctx.fillText("Press esc or p to exit to main menu", canvas.width / 2, canvas.height / 2 + 50);
        ctx.restore();
    }
    }




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
    menubutton.draw(ctx);

    if (gameMode === "tutorial") {
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    const lines = tutorialTexts[tutorialStep].split("\n");
    lines.forEach((line, i) => {
        ctx.fillText(line, canvas.width / 2, 50 + i * 25);
    });
}
    // mobilebutton.draw(ctx);
    handleWallCollision();
for (const ball of balls) {
    if(!ball.isPlayer || storyPhase !== "airstrike"){
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius*ball.size, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.globalAlpha = ball.isDead ? 0.25 : 1;
    ctx.fill();
    ctx.globalAlpha = 1;
    }
    drawEnemyWeapon(ball);
    drawEnemyHat(ball);
    drawEnemyHealthBar(ball);
    if(ball.isEnemy){
        if (ball.weapon === "Medic") {
            healEnemies(ball);
        }else{
        enemyShoot(ball);
        enemyMelee(ball);
        }
        ball.shootCooldown = Math.max(0, ball.shootCooldown - 1);
    }

    if (ball === balls[0]) {
            if (keys[binds.dodge] && ball.dodgeCooldown <= 0) {
                const dx = mouseX - ball.x;
                const dy = mouseY - ball.y;
                const distance = Math.hypot(dx, dy);

                if (distance > 0) {
                    ball.dx = (dx / distance) * 6;
                    ball.dy = (dy / distance) * 6;
                }

                ball.hit = true;
                ball.dodgeCooldown = 30;

                setTimeout(() => {
                    ball.hit = false;
                }, 150);
            }

            ball.dodgeCooldown = Math.max(0, ball.dodgeCooldown - 1);

            ball.dx *= 0.75;
            ball.dy *= 0.75;
        
        const sprint = keys[binds.speed] ? 1.5 : 1;        const boost = Date.now() < speedBoost ? 2 : 1;
        const run = sprint * boost;
        if (keys[binds.up] || (mobileW.visible && mobileW.update())) {
        ball.y -= 2 * stats.speed * run;
    }
        if (keys[binds.down] || (mobileS.visible && mobileS.update())) {
        ball.y += 2*stats.speed * run;
    }
        if (keys[binds.left] || (mobileA.visible && mobileA.update())) {
        ball.x -= 2*stats.speed * run;
    }
        if (keys[binds.right] || (mobileD.visible && mobileD.update())) {
        ball.x += 2*stats.speed * run;
    }
    }

    ball.x += ball.dx;
    ball.y += ball.dy;
    const player = balls.find(b => b.isPlayer);
    if (ball.following===true&&ball.isEnemy&&!ball.isDead&&!player.isDead&&player.isDead===false){
                startFollowing(ball);
            }
    
    if (ball.x + ball.radius * ball.size > canvas.width) {
    ball.x = canvas.width - ball.radius * ball.size;
    ball.dx = -Math.abs(ball.dx);
} else if (ball.x - ball.radius * ball.size < 0) {
    ball.x = ball.radius * ball.size;
    ball.dx = Math.abs(ball.dx);
}

if (ball.y + ball.radius * ball.size > canvas.height) {
    ball.y = canvas.height - ball.radius * ball.size;
    ball.dy = -Math.abs(ball.dy);
} else if (ball.y - ball.radius * ball.size < 0) {
    ball.y = ball.radius * ball.size;
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


        if (correctTarget && distance < projectile.radius + target.radius * target.size) {
            projectile.remove = true;

            if (target.isPlayer && !isInvulnerable(target)) {
                target.health -= projectile.damage;
                target.health = Math.max(0, target.health);
                target.color = "lightblue";

            
                
                setTimeout(() => {
                if (!target.isDead) {
                        target.color = "blue";
                    }
                }, 200);

            if (target.health <= 0) {
                    combo = 0;
                    target.isDead = true;

                    setTimeout(() => {
                        target.isDead = false;
                        target.invulnerableUntil = Date.now() + spawnProtectionMs;
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
                target.color = target.weapon === "Medic" ? "lightgreen" : "lightcoral";
                target.health -= projectile.damage * (target.shielded ? 0.3 : 1);
                target.health = Math.max(0, target.health);
                checkShieldBreak(target);
                if (projectile.isExplosive) {
                    createExplosion(
                        projectile.x,
                        projectile.y,
                        projectile.explosionRadius,
                        projectile.explosionDamage
                    );
                }

                if (target.health <= 0) {
                    addCombo();
                    target.isDead = true;
                    target.transparency = 0.95;
                    target.dx = projectile.dx / 15;
                    target.dy = projectile.dy / 15;
                    if (Math.random() <0.3){
                            objects.push(new Object("ammo", target.x, target.y));
                    }
                    setTimeout(() => {
                        if (!target.remove) {
                            target.remove = true;
                            money += 10;
                            if (gameMode === "wave" || gameMode === "tutorial" || gameMode === "endless" || gameMode === "story") {
                                enemyCounter--;
                            }
                        }
                    }, 800);
                } else {
                    setTimeout(() => {
                        if (!target.isDead && !target.remove) {
                            target.color = target.weapon === "Medic" ? "limegreen" : "red";
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
            ball2.x += ball1.radius * ball1.size + ball2.radius * ball2.size;
            continue;
        }

        
        if (distance < ball1.radius * ball1.size + ball2.radius * ball2.size) {
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
                ball1.radius * ball1.size + ball2.radius * ball2.size - distance;
            if(ball1.isPlayer&&ball2.isEnemy&&ball1.hit==false){
                ball1.hit=true;
                ball1.health -= ball2.damage;
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
                        ball1.invulnerableUntil = Date.now() + spawnProtectionMs;
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
    if (player && isInvulnerable(player)) player.health = player.maxHealth;
    if (player) {
        if (player.isDead && !player.deathCounted) {
            deaths++;
            player.deathCounted = true;
        } else if (!player.isDead) {
            player.deathCounted = false;
        }
        for (const obj of objects) {
            if (["heal", "rock", "speedboost", "mine", "ammo", "coin", "keycard"].includes(obj.type)) {
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

                if (distance < obj.radius + player.radius * player.size) {
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

                if (distance < obj.radius + enemy.radius * enemy.size) {
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

        if (dx * dx + dy * dy < player.radius * player.radius * player.size&&!player.isDead) {
            if (obj.type === "keycard") {
                storyObjectiveComplete = true;
                obj.remove = true;
                continue;
            }
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
            if (obj.type === "ammo") {
                if (currentWeapon.ammo !== Infinity){
                    currentWeapon.ammo += obj.ammoAmount;
                }
            }
            if(obj.type === "coin") {
                money += obj.coinAmount;
            }

            obj.remove = true;
            if (player.health <= 0 && !player.isDead) {
                player.isDead = true;
                player.transparency = 0.95;

                setTimeout(() => {
                    player.isDead = false;
                    player.invulnerableUntil = Date.now() + spawnProtectionMs;
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
if (keys[binds.menu] && !mWasPressed && gameScreen === "game") {
    menu.visible = !menu.visible;
}
if (keys[binds.shop] && !nWasPressed && gameScreen === "game") {
    shopmenu.visible = !shopmenu.visible;
}
if (keys[binds.health] && !hWasPressed && gameScreen === "game") {
    showEnemyHealthbars = !showEnemyHealthbars;
}

hWasPressed = keys[binds.health];
nWasPressed = keys[binds.shop];
mWasPressed = keys[binds.menu];
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
    updateAbilities(player);
    for (let i = 0; i < abilities.length; i++) {
        const down = keys[binds["ability" + (i + 1)]];
        if (keys[binds.ability] && down && !abilityKey[i] && !player.isDead) {
            useAbility(i, player);
        }
        abilityKey[i] = down;
    }
    if (keys[binds.ability]) {
        drawAbilityBar();
    }
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
//info.draw(ctx);
drawHUD(player);
if (keys[binds.shoot] && player && !player.isDead) {
    if (currentWeapon.name === "AK47" || !fWasPressed) {
    const newProjectiles = currentWeapon.shoot(player, mouseX, mouseY);
    balls.push(...newProjectiles);
    if (newProjectiles.length > 0 && gameMode === "tutorial" && tutorialStep === 5) {
        tutorialShots++;
    }
}
}
if (keys[binds.melee] && !gWasPressed && player && !player.isDead) {
    currentMelee.swing();
}

fWasPressed = keys[binds.shoot];
gWasPressed = keys[binds.melee];

if (skinsmenu.visible) {
    // if (clickedFrame === skinsmenu && button5.isPressed()) {
    //     balls[0].color = "red";
    // }

    // if (clickedFrame === skinsmenu && button6.isPressed()) {
    //     balls[0].color = "blue";
    // }
    // if (clickedFrame === skinsmenu && button7.isPressed()) {
    //     balls[0].color = "green";
    // }
    // if (clickedFrame === skinsmenu && button8.isPressed()) {
    //     balls[0].color = "yellow";
    // }
}
if (shopmenu.visible) {
    if (buttonshopGun.isPressed()) {
        shopPage=0;
        showCategory("Guns");
    } else if (buttonshopUtil.isPressed()) {
        shopPage=0;
        showCategory("Utility");
    } else if (buttonshopSkins.isPressed()) {
        shopPage=0;
        showCategory("Skins");
    } else if (buttonshopArmor.isPressed()) {
        shopPage=0;
        showCategory("Armor");
    }

    for (const entry of itemButtons) {
        if (entry.button.isPressed()) {
            buyItem(entry.item);


            if (
            gameMode === "tutorial" &&
            tutorialStep === 4 &&
            currentCategory === "Skins" &&
            accessories.includes(entry.item.name) &&
            (entry.item.price ?? 0) === 0
        ) {
            tutorialAccessoryBought = true;
        }
    }

    }
    

    if (shopPrevButton.isPressed()) {
    shopPage = Math.max(0, shopPage - 1);
    showCategory(currentCategory);
    }

    if (shopNextButton.isPressed()) {
        const totalPages = Math.ceil(
            shopItems[currentCategory].length / SHOP_ITEMS_PER_PAGE
        );

        shopPage = Math.min(totalPages - 1, shopPage + 1);
        showCategory(currentCategory);
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
    if(volDown.isPressed()){
        masterVolume = Math.max(0, masterVolume - 0.1);
        volText.text = `Vol: ${Math.round(masterVolume * 100)}%`;
    }
    if(volUp.isPressed()){
        masterVolume = Math.min(1, masterVolume + 0.1);
        volText.text = `Vol: ${Math.round(masterVolume * 100)}%`;
    }
    if(keybindsButton.isPressed()){
        keybindsmenu.visible = !keybindsmenu.visible;
    }
}

if (keybindsmenu.visible && clickedFrame === keybindsmenu) {
    for (const [key] of bindNames) {
        if (bindButtons[key].isPressed()) {
            rebinding = key;
            updateBindText();
        }
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
            size: 1,
            speed: 1,
            damage: 10,
            isDead: false,
            isEnemy: true,
            following: false,
            strafe: false,
            stuckTimer: 0,
            weapon: null, //weaponslist[Math.floor(Math.random() * weaponslist.length)]
            shootCooldown: 0,
            shootDelay: 1000,
            accessory: null,
        };

        balls.push(newBall);

        const frameIndex = ballFrames.length;
        const frameX = 350 + (frameIndex % 2) * 230;
        const frameY = 100 + (Math.floor(frameIndex / 2) % 3) * 140;
        const newFrame = new Frame(
            frameX, frameY, 200, 120, "lightgray", 0.5, newBall, true, "Ball Frame"
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

function rayHitsWall(x1, y1, x2, y2, wall, radius) {
    const left = wall.x - radius;
    const right = wall.x + wall.width + radius;
    const top = wall.y - radius;
    const bottom = wall.y + wall.height + radius;
    const dx = x2 - x1;
    const dy = y2 - y1;
    let tMin = 0.02;
    let tMax = 0.98;

    if(dx === 0) {
        if(x1 <= left || x1 >= right) return false;
    } else {
        const t1 = (left - x1) / dx;
        const t2 = (right - x1) / dx;

        tMin = Math.max(tMin, Math.min(t1, t2));
        tMax = Math.min(tMax, Math.max(t1, t2));
    }

    if(dy === 0) {
        if(y1 <= top || y1 >= bottom) return false;
    } else {
        const t1 = (top - y1) / dy;
        const t2 = (bottom - y1) / dy;

        tMin = Math.max(tMin, Math.min(t1, t2));
        tMax = Math.min(tMax, Math.max(t1, t2));
    }

    return tMin <= tMax;
}

function getWallWaypoint(ball, player) {
    if (!wallsVisible) return null;
    const radius = ball.radius * ball.size;
    let directBlocked = false;
    for (const wall of walls) {
        if (!wall.solid) continue;
        if (bossFightActive && wall.bosswall) continue;
        if (rayHitsWall(ball.x, ball.y, player.x, player.y, wall, radius - 2)) {
            directBlocked = true;
            break;
        }
    }
    if (!directBlocked) return null;

    const cellSize = 10;
    const cols = Math.floor(canvas.width / cellSize);
    const rows = Math.floor(canvas.height / cellSize);
    const isCellWalkable = (col, row) => {
        const x = col * cellSize + cellSize / 2;
        const y = row * cellSize + cellSize / 2;
        if (x < radius || x > canvas.width - radius || y < radius || y > canvas.height - radius) {
            return false;
        }
        for (const wall of walls) {
            if (!wall.solid || (bossFightActive && wall.bosswall)) continue;
            const closestX = Math.max(wall.x, Math.min(x, wall.x + wall.width));
            const closestY = Math.max(wall.y, Math.min(y, wall.y + wall.height));
            const dx = x - closestX;
            const dy = y - closestY;
            if (dx * dx + dy * dy < (radius + 1) * (radius + 1)) {
                return false;
            }
        }
        return true;
    };

    const findNearestWalkableCell = (startCol, startRow) => {
        const cx = Math.max(0, Math.min(cols - 1, Math.floor(startCol / cellSize)));
        const cy = Math.max(0, Math.min(rows - 1, Math.floor(startRow / cellSize)));
        if (isCellWalkable(cx, cy)) {
            return { col: cx, row: cy };
        }

        for (let r = 1; r < Math.max(cols, rows); r++) {
            for (let dx = -r; dx <= r; dx++) {
                for (let dy = -r; dy <= r; dy++) {
                    const col = cx + dx;
                    const row = cy + dy;
                    if (col >= 0 && col < cols && row >= 0 && row < rows) {
                        if (isCellWalkable(col, row)) {
                            return { col, row };
                        }
                    }
                }
            }
        }
        return { col: cx, row: cy };
    };

    const { col: nearestCol, row: nearestRow } = findNearestWalkableCell(ball.x, ball.y);
    const { col: playerCol, row: playerRow } = findNearestWalkableCell(player.x, player.y);

    const start = nearestRow * cols + nearestCol;
    const goal = playerRow * cols + playerCol;
    if (start === goal) return null;

    const parent = new Array(cols * rows).fill(-1);
    const visited = new Set([start]);
    const queue = [];
    let head = 0;
    let tail = 0;
    queue[tail++] = start;
    parent[start] = start;

    const directions = [
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 },
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 }
    ];

    let found = false;
    while (head < tail) {
        const current = queue[head++];
        const currentCol = current % cols;
        const currentRow = Math.floor(current / cols);
        if (current === goal) {
            found = true;
            break;
        }

        for (const dir of directions) {
            const newCol = currentCol + dir.dx;
            const newRow = currentRow + dir.dy;
            if (newCol >= 0 && newCol < cols && newRow >= 0 && newRow < rows) {
                const newIndex = newRow * cols + newCol;
                if (!visited.has(newIndex) && isCellWalkable(newCol, newRow)) {
                    visited.add(newIndex);
                    queue[tail++] = newIndex;
                    parent[newIndex] = current;
                }
            }
        }
    }

    if (!found) return null;

    const path = [];
    let current = goal;
    while (current !== start) {
        path.unshift(current);
        current = parent[current];
    }
    path.unshift(start);

    const targetIndex = path[Math.min(2, path.length - 1)];
    return {
        x: (targetIndex % cols) * cellSize + cellSize / 2,
        y: Math.floor(targetIndex / cols) * cellSize + cellSize / 2
    };
}
function startFollowing(ball) {
    const player = balls.find(b => b.isPlayer);
    if (!player || player.isDead) return;

    if (ball.stuckTimer === undefined) {
        ball.stuckTimer = 0;
        ball.lastDistance = Infinity;
    }
    if (ball.StrafeDir === undefined) {
        ball.StrafeDir = Math.random() < 0.5 ? -1 : 1;
    }

    const dx = player.x - ball.x;
    const dy = player.y - ball.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance >= ball.lastDistance - 0.2) {
        ball.stuckTimer++;
    } else {
        ball.stuckTimer = 0;
    }
    ball.lastDistance = distance;

    if (Math.random() < 0.02) {
        ball.StrafeDir *= -1;
    }

    const isStuck = ball.stuckTimer > 10;
    const strafeStrength = isStuck ? 5 : 1;

    const waypoint = getWallWaypoint(ball, player);

    if (waypoint) {
        const wdx = waypoint.x - ball.x;
        const wdy = waypoint.y - ball.y;
        const wDist = Math.sqrt(wdx * wdx + wdy * wdy);

        if (wDist > 0) {
            ball.dx = (wdx / wDist) * 2 * ball.speed;
            ball.dy = (wdy / wDist) * 2 * ball.speed;
        }
        return;
    }

    const targetDx = player.x - ball.x;
    const targetDy = player.y - ball.y;
    const targetDistance = Math.sqrt(targetDx * targetDx + targetDy * targetDy);

    if (targetDistance > 0) {
        const radius = ball.radius * ball.size;
        let canStrafeSafely = true;
        if (wallsVisible) {
            for (const wall of walls) {
                if (!wall.solid) continue;
                if (rayHitsWall(ball.x, ball.y, player.x, player.y, wall, radius + 25)) {
                    canStrafeSafely = false;
                    break;
                }
            }
        }

        if (ball.strafe === true && canStrafeSafely && !isStuck) {
            ball.dx = (
                targetDx / targetDistance -
                (targetDy / targetDistance) * 0.8 * ball.StrafeDir
            ) * 2 * strafeStrength * ball.speed;

            ball.dy = (
                targetDy / targetDistance +
                (targetDx / targetDistance) * 0.8 * ball.StrafeDir
            ) * 2 * strafeStrength * ball.speed;
        } else {
            ball.dx = targetDx / targetDistance * 2 * ball.speed;
            ball.dy = targetDy / targetDistance * 2 * ball.speed;
        }
    }
    const weaponDistance = keepDistance[ball.weapon];
    if (weaponDistance && targetDistance > 0) {
        if (targetDistance < weaponDistance - 30) {
            ball.dx = -targetDx / targetDistance * 2 * ball.speed;
            ball.dy = -targetDy / targetDistance * 2 * ball.speed;
            return;
        }
        if (targetDistance < weaponDistance + 30) {
            ball.dx = -targetDy / targetDistance * ball.StrafeDir * 1.5;
            ball.dy = targetDx / targetDistance * ball.StrafeDir * 1.5;
            return;
        }
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
updateShopHover();
drawShopTooltip();
balls = balls.filter(ball =>
    !ball.remove &&
    (!ball.isProjectile || Date.now() - ball.createdAt < 3000)
);
if (gameMode === "tutorial") {
    drawTutorialArrow();
    drawTutorialShotProgress();
    drawTutorialMeleeProgress();
}
canvas.style.cursor = "default"
}
    if (gameScreen === "game"){
        drawWaveIndicator();
        drawDialogue();
        drawCaptureZone();
        drawCaptureProgress();
        drawCrossHair();
        drawAlarm();
        drawAirstrike();
    }
    if (showUpgradePrompt) {
        drawUpgradePrompt();
        canvas.style.cursor = "default"
    }
    justClicked=false;
    requestAnimationFrame(animate);
}



animate();