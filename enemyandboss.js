//SFX
const laserSound = new Audio('sfx/Laser.mp3');
const chargeSound = new Audio('sfx/ChargeLaser.mp3');
const bombSound = new Audio('sfx/bomb.mp3');
const arrowSound = new Audio('sfx/ArrowSound.mp3');
const swingsword = new Audio('sfx/Swing.mp3');
const dashenemy = new Audio('sfx/EnemyDash.mp3');
const gunshoot = new Audio('sfx/gunshoot.mp3');

// Register for global volume management
window.allGameSounds = [laserSound, chargeSound, bombSound, arrowSound, swingsword, dashenemy, gunshoot];

// Enemy & Boss Rewards (XP & Coin)
const enemyRewards = {
    1: { xp: 1, coin: 1 },    // Chaser
    2: { xp: 1, coin: 1 },    // Bomber
    3: { xp: 2, coin: 2 },    // Charger
    4: { xp: 2, coin: 2 },    // Archer
    5: { xp: 3, coin: 3 },    // Caster (Artillery)
    6: { xp: 3, coin: 3 },    // Mage (Laser)
    7: { xp: 2, coin: 2 },    // Slime (Jumper)
    8: { xp: 3, coin: 3 },    // Mage (Buffer)
    9: { xp: 2, coin: 2 },    // Skeleton (Swordsman)
    10: { xp: 20, coin: 20 }, // Boss: Necromancer
    11: { xp: 25, coin: 25 }, // Boss: AncientMage
    12: { xp: 30, coin: 30 }, // Boss: SkeletonKing
    13: { xp: 25, coin: 25 }, // Boss: SlimeKing
    14: { xp: 40, coin: 40 }, // Boss: Titan
    131: { xp: 10, coin: 10 },// Mini Boss: Red Slime
    132: { xp: 10, coin: 10 },// Mini Boss: Blue Slime
    133: { xp: 10, coin: 10 },// Mini Boss: Yellow Slime
    134: { xp: 10, coin: 10 },// Mini Boss: Green Slime
};

//Img Boss&Enemy
const enemyImages = {};
for (let i = 1; i <= 9; i++) {
    enemyImages[i] = new Image();
}
enemyImages[1].src = 'img_enemy/1_Chaser.png';
enemyImages[2].src = 'img_enemy/2_bomber.png';
enemyImages[3].src = 'img_enemy/3_charger.png';
enemyImages[4].src = 'img_enemy/4_Archer2.png';
enemyImages[5].src = 'img_enemy/5_mage.png';
enemyImages[6].src = 'img_enemy/6_Laser.png';
enemyImages[7].src = 'img_enemy/7_Slime.png';
enemyImages[8].src = 'img_enemy/8_Buffer.png';
enemyImages[9].src = 'img_enemy/9_skeleton.png';

const bossImages = {};

function loadBossImage(key, src) {
    const img = new Image();
    img.onerror = () => console.warn(`[Boss] Failed to load image: ${src}`);
    img.src = src;
    bossImages[key] = img;
}

loadBossImage(10, 'img_boss/Necromancer.png');
loadBossImage(11, 'img_boss/AncientMage.png');
loadBossImage(12, 'img_boss/Skeleton_king.png');
loadBossImage(13, 'img_boss/Slime_king.png');
loadBossImage(131, 'img_boss/Slime_red.png');
loadBossImage(132, 'img_boss/Slime_blue.png');
loadBossImage(133, 'img_boss/Slime_yellow.png');
loadBossImage(134, 'img_boss/Slime_green.png');
loadBossImage(14, 'img_boss/Giant.png');
loadBossImage('14_up', 'img_boss/Giant_up.png');
loadBossImage('14_down', 'img_boss/Giant_down.png');
// --- Walk Animation Frames ---
const bossWalkFrames = {};

const bossWalkDefs = [
    { id: 10, name: 'Necromancer' },
    { id: 11, name: 'AncientMage' },
    { id: 12, name: 'Skeleton_king' },
    { id: 13, name: 'Slime_king' },
    // { id: 131, name: 'Slime_red' },
    // { id: 132, name: 'Slime_blue' },
    // { id: 133, name: 'Slime_yellow' },
    // { id: 134, name: 'Slime_green' },
    { id: 14, name: 'Giant' },
];

bossWalkDefs.forEach(({ id, name }) => {
    bossWalkFrames[id] = [];
    for (let i = 1; i <= 4; i++) {
        const img = new Image();
        img.onerror = () => console.warn(`[Boss] Failed to load walk frame: img_boss/${name}_walk${i}.png`);
        img.src = `img_boss/${name}_walk${i}.png`;
        bossWalkFrames[id].push(img);
    }
});
function getBossWalkImage(boss) {
    const WALK_STATES = ['chase', 'lunge', 'idle', 'rapid_firing', 'prepare', 'dash', 'recover'];
    const ATTACK_STATES = ['cast_prepare', 'firing', 'prepare_swing', 'swinging', 'landed', 'exploding'];
    const mode = boss.state && boss.state.mode ? boss.state.mode : null;

    if (ATTACK_STATES.includes(mode)) return null;
    if (mode !== null && !WALK_STATES.includes(mode)) return null;

    const frames = bossWalkFrames[boss.type];
    if (!frames || frames.length === 0) return null;

    const FRAME_SPEED = 30;
    const frameIndex = Math.floor(frameCount / FRAME_SPEED) % frames.length;
    const img = frames[frameIndex];
    return img || null;
}
// --- End Walk Animation ---

const swordImg = new Image();
swordImg.src = 'img/Sword.png';
const staffImg = new Image();
staffImg.src = 'img/Staff.png';
const arrowImg = new Image();
arrowImg.src = 'img/Arrow.png';
const bowImg = new Image();
bowImg.src = 'img/Bow.png';
const magicCircleImg = new Image();
magicCircleImg.src = 'img/MagicCircle.png';
const weaponGiantImg = new Image();
weaponGiantImg.src = 'img/Weapon_Giant.png';

function axialMove(entity, angleToPlayer, speed) {
    const dx = Math.cos(angleToPlayer);
    const dy = Math.sin(angleToPlayer);
    const len = Math.hypot(dx, dy) || 1;
    entity.x += (Math.sign(dx) * speed) / len * Math.abs(dx);
    entity.y += (Math.sign(dy) * speed) / len * Math.abs(dy);
}
const enemyDefinitions = [
    { id: 1, name: "1. Chaser", color: "#FF5555" },
    { id: 2, name: "2. Bomber", color: "#FFAA00" },
    { id: 3, name: "3. Charger", color: "#8855FF" },
    { id: 4, name: "4. Archer", color: "#55AAFF" },
    { id: 5, name: "5. Caster", color: "#55FF55" },
    { id: 6, name: "6. Mage", color: "#FF00FF" },
    { id: 7, name: "7. Slime", color: "#FFA500" },
    { id: 8, name: "8. Buffer", color: "#FF0055" },
    { id: 9, name: "9. Skeleton", color: "#AAAAAA" },
    { id: 10, name: "Boss 1: Necro", color: "#800080" },
    { id: 11, name: "Boss 2: Sage", color: "#969696" },
    { id: 12, name: "Boss 3: Dasher", color: "#00FFCC" },
    { id: 13, name: "Boss 4: Core", color: "#8a8a00" },
    { id: 14, name: "Boss 5: Titan", color: "#8B4513" }
];

function drawEntityHPBar(ctx, x, y, radius, hp, maxHp, isBoss) {
    if (hp <= 0 || hp >= maxHp && !isBoss) return; // Only show if damaged (unless Boss)

    const barWidth = isBoss ? radius * 2.8 : radius * 2.2;
    const barHeight = isBoss ? 10 : 6;
    const offsetY = isBoss ? radius + 25 : radius + 15;

    const xPos = x - barWidth / 2;
    const yPos = y - offsetY;

    ctx.save();
    // Shadow/Glow for Boss
    if (isBoss) {
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 10;
    }

    // Background
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(xPos, yPos, barWidth, barHeight, 20);
    } else {
        ctx.rect(xPos, yPos, barWidth, barHeight); // Fallback
    }
    ctx.fill();

    // Fill
    const ratio = Math.max(0, hp / maxHp);
    if (ratio > 0) {
        // Gradient color
        let color = "#2ecc71"; // Green
        if (ratio < 0.25) color = "#ff4757"; // Red
        else if (ratio < 0.6) color = "#ffa502"; // Orange/Yellow

        ctx.fillStyle = color;
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(xPos, yPos, barWidth * ratio, barHeight, 20);
        } else {
            ctx.rect(xPos, yPos, barWidth * ratio, barHeight); // Fallback
        }
        ctx.fill();

        // Inner highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(xPos, yPos, barWidth * ratio, barHeight / 2, 20);
        } else {
            ctx.rect(xPos, yPos, barWidth * ratio, barHeight / 2);
        }
        ctx.fill();
    }
    ctx.restore();
}

class Enemy {
    constructor(x, y, type, id = null) {
        this.id = id || (Date.now() + Math.random()).toString();
        this.x = x;
        this.y = y;
        this.type = type;
        this.def = enemyDefinitions.find(d => d.id === type) || { color: '#FF5555' };
        this.color = this.def.color;
        this.dead = false;
        this.isBuffed = false;
        this.hitTimer = 0;
        this.init(type);
        this.baseSpeed = this.speed;
        if (this.type === 3) this.baseDashSpeed = this.state.dashSpeed;

        if (this.type < 10 || this.type > 100) {
            this.spawnTimer = 30; // 0.5s summon animation
        } else {
            this.spawnTimer = 0;
        }
        this.kbX = 0;
        this.kbY = 0;
    }

    init(type) {
        switch (type) {
            case 1: // Chaser
                this.hp = 30; this.maxHp = 30;
                this.speed = 0.6;
                this.radius = 16;
                this.state = { mode: 'chase' };
                break;
            case 2: // Bomber
                this.hp = 20; this.maxHp = 20;
                this.speed = 0.4;
                this.radius = 20;
                this.state = { mode: 'chase', explodeTimer: 0 };
                break;
            case 3: // Big Charger
                this.hp = 80; this.maxHp = 80;
                this.speed = 0;
                this.radius = 35;
                this.state = { mode: 'aiming', timer: 120, angle: Math.PI / 2, dashSpeed: 12 };
                break;
            case 4: // Archer
                this.hp = 20; this.maxHp = 20;
                this.speed = 0.5;
                this.radius = 16;
                this.state = { mode: 'chase', distance: 200, cooldown: 0 };
                break;
            case 5: // Caster
                this.hp = 25; this.maxHp = 25;
                this.speed = 0.45;
                this.radius = 18;
                this.state = { distance: 250, cooldown: 120 };
                break;
            case 6: // Mage
                this.hp = 25; this.maxHp = 25;
                this.speed = 0.3;
                this.radius = 16;
                this.state = { mode: 'chase', timer: 120, angle: 0 };
                break;
            case 7: // Slime
                this.hp = 40; this.maxHp = 40;
                this.speed = 0.5;
                this.radius = 20;
                this.state = { mode: 'chase', timer: 100, z: 0, vz: 0, targetX: 0, targetY: 0 };
                break;
            case 8: // Mage Buffer
                this.hp = 40; this.maxHp = 40;
                this.speed = 0.3;
                this.radius = 16;
                this.state = { targets: [] };
                break;
            case 9: // Skeleton
                this.hp = 35; this.maxHp = 35;
                this.speed = 0.65;
                this.radius = 18;
                this.state = { mode: 'chase', timer: 0, cooldown: 0, baseAngle: 0, currentAngle: 0 };
                break;
        }
    }

    update() {
        if (this.dead) return;

        if (this.spawnTimer > 0) {
            this.spawnTimer--;
            return; // Skip logic while spawning
        }

        if (this.hitTimer > 0) this.hitTimer--;

        // Apply knockback
        this.x += this.kbX;
        this.y += this.kbY;
        this.kbX *= 0.8;
        this.kbY *= 0.8;

        if (this.hp <= 0 && !this.dead) {
            this.dead = true;
            if (this.onDeath) this.onDeath();

            // Give reward when enemy dies (Autoritative: only Host/Single Player awards XP/Coins)
            let isHostOrOffline = false;
            try {
                if (typeof netMode === 'undefined' || netMode !== 'join') isHostOrOffline = true;
            } catch (e) {
                isHostOrOffline = true;
            }
            if (isHostOrOffline) {
                const reward = enemyRewards[this.type] || { xp: 1, coin: 1 };
                if (typeof gameLogic !== 'undefined' && gameLogic.levelManager) {
                    if (reward.xp > 0) gameLogic.levelManager.spawnXP(this.x, this.y, reward.xp);
                    if (reward.coin > 0) gameLogic.levelManager.spawnCoin(this.x, this.y, reward.coin);
                }
            }
            return;
        }

        let target = player;
        if (typeof player2 !== 'undefined' && player2 && player2.active) {
            const dist1 = getDist(this.x, this.y, player.x, player.y);
            const dist2 = getDist(this.x, this.y, player2.x, player2.y);
            if (player.isDead || (!player2.isDead && dist2 < dist1)) {
                target = player2;
            }
        }
        if (target.isDead && typeof player2 !== 'undefined' && player2 && player2.active && !player2.isDead) {
            target = target === player ? player2 : player;
        }

        const distToPlayer = getDist(this.x, this.y, target.x, target.y);
        const angleToPlayer = getAngle(this.x, this.y, target.x, target.y);

        switch (this.type) {
            case 1: // Chaser
                // this.x += Math.cos(angleToPlayer) * this.speed;
                // this.y += Math.sin(angleToPlayer) * this.speed;
                axialMove(this, angleToPlayer, this.speed);
                break;

            case 2: // Walking Bomber
                if (this.state.mode === 'chase') {
                    // this.x += Math.cos(angleToPlayer) * this.speed;
                    // this.y += Math.sin(angleToPlayer) * this.speed;
                    axialMove(this, angleToPlayer, this.speed);

                    // Trigger exploding range
                    if (distToPlayer < 80) {
                        this.state.mode = 'exploding';
                        this.state.explodeTimer = 60; // 1s warning
                    }
                } else if (this.state.mode === 'exploding') {
                    this.speed = 0; // stop moving
                    this.state.explodeTimer--;
                    if (this.state.explodeTimer <= 0) {
                        this.explode();
                        if (window.currentVolume > 0) bombSound.play();
                    }
                }
                break;

            case 3: // Big Charger
                if (this.state.mode === 'aiming') {
                    // Turn slowly towards player
                    let diff = angleToPlayer - this.state.angle;
                    while (diff < -Math.PI) diff += Math.PI * 2;
                    while (diff > Math.PI) diff -= Math.PI * 2;
                    this.state.angle += Math.sign(diff) * Math.min(Math.abs(diff), 0.05);

                    this.state.timer--;
                    if (this.state.timer <= 0) {
                        this.state.mode = 'dashing';
                        this.state.timer = 90; // dash duration
                        if (window.currentVolume > 0) dashenemy.play();
                    }
                } else if (this.state.mode === 'dashing') {
                    this.x += Math.cos(this.state.angle) * this.state.dashSpeed * 0.4;
                    this.y += Math.sin(this.state.angle) * this.state.dashSpeed * 0.4;

                    this.state.timer--;
                    if (this.state.timer <= 0) {
                        this.state.mode = 'resting';
                        this.state.timer = 75; // rest for 1s
                    }
                } else if (this.state.mode === 'resting') {
                    this.state.timer--;
                    if (this.state.timer <= 0) {
                        this.state.mode = 'aiming';
                        this.state.timer = 100; // aim for 1.5s
                    }
                }
                // Keep inside canvas so it doesn't fly infinitely away
                // this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
                // this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
                break;

            case 4: // Striker / Ranger
                // Distance check logic
                if (distToPlayer > this.state.distance + 100) {
                    this.state.mode = 'chase';
                } else if (distToPlayer < this.state.distance - 100) {
                    this.state.mode = 'flee';
                } else {
                    this.state.mode = 'shoot';
                }

                // Movement
                if (this.state.mode === 'chase') {
                    axialMove(this, angleToPlayer, this.speed / 1.35);
                } else if (this.state.mode === 'flee') {
                    // ปรับให้เดินหนี (ความเร็วติดลบ)
                    axialMove(this, angleToPlayer, -this.speed / 1.35);
                }

                // Protect from moving off screen while fleeing
                // this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
                // this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));

                // Shooting
                if (this.state.cooldown > 0) {
                    this.state.cooldown--;
                } else if (this.state.mode === 'shoot') {
                    if (!this.state.aiming) {
                        this.state.aiming = true;
                        this.state.aimTimer = 18; // 0.3s delay at 60 FPS
                    }
                }

                if (this.state.aiming) {
                    if (this.state.aimTimer > 0) {
                        this.state.aimTimer--;
                    } else {
                        this.state.aiming = false;
                        const bowX = this.x + Math.cos(angleToPlayer) * 20;
                        const bowY = this.y + Math.sin(angleToPlayer) * 20;
                        bullets.push(new Bullet(bowX, bowY, angleToPlayer, 2, 6, this.color, 0, 4));
                        if (window.currentVolume > 0) arrowSound.play();
                        this.state.cooldown = 200;
                    }
                }
                break;

            case 5: // Artillery
                // ปรับให้เดินเข้าหาถ้ายังไม่อยู่ในระยะโจมตี
                if (distToPlayer > 450) {
                    axialMove(this, angleToPlayer, this.speed);
                } else if (distToPlayer < 200) {
                    // เดินหนีถ้าผู้เล่นเข้าใกล้เกินไป
                    axialMove(this, angleToPlayer, -this.speed);
                }

                if (this.state.cooldown > 0) {
                    this.state.cooldown--;
                } else if (distToPlayer < 450) { // ระยะกลาง: จะเริ่มยิงเมื่อผู้เล่นเข้ามาในระยะ 450 เท่านั้น
                    // Drop Artillery Marker exactly at target location
                    aoeMarkers.push({
                        x: target.x,
                        y: target.y,
                        radius: 80,
                        timer: 0,
                        maxTimer: 180 // ปรับให้ระเบิดช้าลง (3 วินาที) จากเดิม 90 (1.5 วินาที)

                    });

                    this.state.cooldown = 180; // Shoot every 3 seconds
                }
                break;;

            case 6: // Laser
                if (this.state.mode === 'chase') {
                    // this.x += Math.cos(angleToPlayer) * this.speed;
                    // this.y += Math.sin(angleToPlayer) * this.speed;
                    axialMove(this, angleToPlayer, this.speed);
                    this.state.timer--;
                    if (this.state.timer <= 0) {
                        this.state.mode = 'aiming';
                        this.state.timer = 120; // 2s charge/warning
                        this.state.angle = angleToPlayer;
                        if (window.currentVolume > 0) chargeSound.play();
                    }
                } else if (this.state.mode === 'aiming') {
                    // Turn slowly to track player
                    let diff = angleToPlayer - this.state.angle;
                    while (diff < -Math.PI) diff += Math.PI * 2;
                    while (diff > Math.PI) diff -= Math.PI * 2;
                    this.state.angle += Math.sign(diff) * Math.min(Math.abs(diff), 0.015);

                    this.state.timer--;
                    if (this.state.timer <= 0) {
                        this.state.mode = 'firing';
                        this.state.timer = 180;

                        if (window.currentVolume > 0) laserSound.play();
                    }
                } else if (this.state.mode === 'firing') {
                    this.state.timer--;

                    // Laser Hit detection (progressively growing laser)
                    const progress = (180 - this.state.timer) / 180; // 0 โ’ 1
                    const eased = progress * progress; // ease-in

                    const currentLaserLength = 1200 * eased;
                    const lx = this.x + Math.cos(this.state.angle) * currentLaserLength;
                    const ly = this.y + Math.sin(this.state.angle) * currentLaserLength;

                    if (Math.sqrt(pbDistSquare(target.x, target.y, this.x, this.y, lx, ly)) < target.radius + 12) {
                        dealDamageToTarget(target, 1);
                    }

                    if (this.state.timer <= 0) {
                        this.state.mode = 'chase';
                        this.state.timer = 120;

                    }
                }

                // this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
                // this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
                break;

            case 7: // Jumper
                if (this.state.mode === 'chase') {
                    // this.x += Math.cos(angleToPlayer) * this.speed;
                    // this.y += Math.sin(angleToPlayer) * this.speed;
                    axialMove(this, angleToPlayer, this.speed);
                    this.state.timer--;
                    if (this.state.timer <= 0 && distToPlayer < 350) {
                        this.state.mode = 'prepare';
                        this.state.timer = 40; // 0.6s warning
                        this.state.targetX = target.x;
                        this.state.targetY = target.y;
                    }
                } else if (this.state.mode === 'prepare') {
                    this.state.timer--;
                    if (this.state.timer <= 0) {
                        this.state.mode = 'jump';
                        this.state.z = 0;
                        this.state.vz = 15;
                        this.state.jumpDist = Math.hypot(this.state.targetX - this.x, this.state.targetY - this.y);
                        this.state.jumpAngle = Math.atan2(this.state.targetY - this.y, this.state.targetX - this.x);
                        this.state.jumpSpeed = this.state.jumpDist / 60;
                    }
                } else if (this.state.mode === 'jump') {
                    this.x += Math.cos(this.state.jumpAngle) * this.state.jumpSpeed;
                    this.y += Math.sin(this.state.jumpAngle) * this.state.jumpSpeed;
                    this.state.z += this.state.vz;
                    this.state.vz -= 0.5; // Gravity

                    if (this.state.z <= 0) {
                        this.state.z = 0;
                        this.state.mode = 'landed';
                        this.state.timer = 30;

                        const blastRadius = 90;
                        if (getDist(this.x, this.y, target.x, target.y) < blastRadius + target.radius) {
                            dealDamageToTarget(target, 1);
                        }
                        aoeBlastEffects.push({
                            x: this.x,
                            y: this.y,
                            radius: blastRadius,
                            life: 1.0
                        });

                        if (window.currentVolume > 0) bombSound.play();
                    }
                } else if (this.state.mode === 'landed') {
                    this.state.timer--;
                    if (this.state.timer <= 0) {
                        this.state.mode = 'chase';
                        this.state.timer = 120;
                    }
                }
                // this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
                // this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
                break;

            case 8: // Mage
                // Keeps distance from player defensively
                if (distToPlayer < 200) {
                    // เดินหนี (ความเร็วติดลบ)
                    axialMove(this, angleToPlayer, -this.speed);
                } else if (distToPlayer > 300) {
                    // เดินเข้าหา
                    axialMove(this, angleToPlayer, this.speed);
                }
                break;
                // this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
                // this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
                break;

            case 9: // Swordsman
                if (this.state.cooldown > 0) this.state.cooldown--;

                if (this.state.mode === 'chase') {
                    // this.x += Math.cos(angleToPlayer) * this.speed;
                    // this.y += Math.sin(angleToPlayer) * this.speed;
                    axialMove(this, angleToPlayer, this.speed);

                    if (distToPlayer < 80 && this.state.cooldown <= 0) {
                        this.state.mode = 'prepare_swing';
                        this.state.timer = 20; // 0.33s wind up
                        this.state.baseAngle = angleToPlayer;
                        let isFacingLeft = Math.abs(this.state.baseAngle) > Math.PI / 2;
                        this.state.swingSign = isFacingLeft ? -1 : 1;
                        this.state.currentAngle = this.state.baseAngle - (this.state.swingSign * Math.PI / 2);
                    }
                } else if (this.state.mode === 'prepare_swing') {
                    // Turn toward player slowly during wind-up
                    let diff = angleToPlayer - this.state.baseAngle;
                    while (diff < -Math.PI) diff += Math.PI * 2;
                    while (diff > Math.PI) diff -= Math.PI * 2;
                    this.state.baseAngle += diff * 0.1;

                    let isFacingLeft = Math.abs(this.state.baseAngle) > Math.PI / 2;
                    this.state.swingSign = isFacingLeft ? -1 : 1;
                    this.state.currentAngle = this.state.baseAngle - (this.state.swingSign * Math.PI / 1.5);

                    this.state.timer--;
                    if (this.state.timer <= 0) {
                        this.state.mode = 'swinging';
                        this.state.timer = 12; // fast swing
                    }
                } else if (this.state.mode === 'swinging') {
                    const progress = 1 - (this.state.timer / 12);
                    // Sweeps across ~1.3 PI back and forth or just forward
                    this.state.currentAngle = this.state.baseAngle - (this.state.swingSign * Math.PI / 1.5) + (this.state.swingSign * Math.PI * 1.33 * progress);

                    // Sword hitbox check
                    const swordLength = 85;
                    const sx = this.x + Math.cos(this.state.currentAngle) * swordLength;
                    const sy = this.y + Math.sin(this.state.currentAngle) * swordLength;

                    if (Math.sqrt(pbDistSquare(target.x, target.y, this.x, this.y, sx, sy)) < target.radius + 10) {
                        dealDamageToTarget(target, 1);
                    }

                    this.state.timer--;
                    if (this.state.timer <= 0) {
                        this.state.mode = 'recovery';
                        this.state.timer = 15;
                    }
                } else if (this.state.mode === 'recovery') {
                    this.state.timer--;
                    if (this.state.timer <= 0) {
                        this.state.mode = 'chase';
                        this.state.cooldown = 100;
                    }
                }

                // this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
                // this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
                break;
        }

        // Melee Body Collision
        if (!this.dead && getDist(this.x, this.y, target.x, target.y) < this.radius + target.radius) {
            if (this.type === 1 || this.type === 3) {
                dealDamageToTarget(target, 1);
            } else if (this.type === 2 && this.state.mode === 'chase') {
                // Instant explode if touched player
                this.explode();
            } else if (this.type === 7) {
                if (this.state.mode !== 'jump' && this.state.mode !== 'landed') dealDamageToTarget(target, 1);
            }
        }
    }

    explode() {
        if (this.dead) return;

        // Explode AoE: Damage player if inside radius
        const blastRadius = 130;

        let targetsToCheck = [player];
        if (typeof player2 !== 'undefined' && player2 && player2.active) targetsToCheck.push(player2);

        targetsToCheck.forEach(t => {
            if (t.isDead) return;
            const d = getDist(this.x, this.y, t.x, t.y);
            if (d < blastRadius + (t.radius || 20)) {
                dealDamageToTarget(t, 1);
            }
        });

        // Create Blast graphic effect
        aoeBlastEffects.push({
            x: this.x,
            y: this.y,
            radius: blastRadius,
            life: 1.0 // 1.0 to 0a
        });
        this.dead = true;
        if (window.currentVolume > 0) bombSound.play();
    }

    draw(ctx) {
        if (this.dead) return;

        if (this.spawnTimer > 0) {
            const ratio = 1 - (this.spawnTimer / 30); // 0 -> 1
            ctx.save();
            ctx.translate(this.x, this.y);

            ctx.rotate(frameCount * 0.1); // spinning effect

            ctx.globalAlpha = ratio;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * ratio * 1.5, 0, Math.PI * 2);
            ctx.strokeStyle = this.color || '#FFF';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.stroke();

            ctx.globalAlpha = ratio * 0.5;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius * ratio, 0, Math.PI * 2);
            ctx.fillStyle = this.color || '#FFF';
            ctx.fill();

            ctx.restore();
            return;
        }

        if (this.type === 7) {
            let shadowScale = 1;
            let drawY = this.y;
            let drawRadius = this.radius;

            if (this.state.mode === 'jump') {
                shadowScale = Math.max(0.3, 1 - (this.state.z / 150));
                drawRadius = this.radius * (1 + (this.state.z / 300));
                drawY = this.y - this.state.z;
            }

            ctx.beginPath();
            ctx.ellipse(this.x, this.y, this.radius * shadowScale, this.radius * 0.4 * shadowScale, 0, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
            ctx.fill();

            if (this.state.mode === 'prepare') {
                ctx.beginPath();
                ctx.arc(this.state.targetX, this.state.targetY, 90, 0, Math.PI * 2);
                ctx.strokeStyle = "rgba(255, 136, 0, 0.6)";
                ctx.lineWidth = 2;
                ctx.setLineDash([8, 8]);
                ctx.stroke();
                ctx.setLineDash([]);

                if (frameCount % 6 < 3) {
                    ctx.shadowColor = "#FFF";
                    ctx.shadowBlur = 10;
                    ctx.beginPath();
                    ctx.arc(this.x, drawY, drawRadius + 4, 0, Math.PI * 2);
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
                    ctx.stroke();
                }
            }

            const imgSize = drawRadius * 3.75;
            const isFacingLeft7 = player.x < this.x;
            ctx.save();
            ctx.translate(this.x, drawY);
            if (!isFacingLeft7) {
                ctx.scale(-1, 1);
            }

            if (enemyImages[7] && enemyImages[7].complete && enemyImages[7].naturalWidth > 0) {
                ctx.drawImage(enemyImages[7], -imgSize / 2, -imgSize / 2, imgSize, imgSize);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, drawRadius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
            ctx.restore();
            ctx.shadowBlur = 0;

            return;
        }

        // Lasers drawing
        if (this.type === 6) {
            // Staff angle โ€” always computed first (used for both Staff draw & laser origin)
            const staffAngle = (this.state.mode === 'chase')
                ? getAngle(this.x, this.y, player.x, player.y)
                : this.state.angle;

            // Staff tip position in world space (staff width = 95)
            const staffTipX = this.x + Math.cos(staffAngle) * 45;
            const staffTipY = this.y + Math.sin(staffAngle) * 45;

            if (this.state.mode === 'aiming') {
                // Aim line from staff tip
                ctx.beginPath();
                ctx.moveTo(staffTipX, staffTipY);
                const lx = staffTipX + Math.cos(this.state.angle) * 1200;
                const ly = staffTipY + Math.sin(this.state.angle) * 1200;
                ctx.lineCap = "round";
                ctx.lineTo(lx, ly);
                ctx.strokeStyle = `rgba(255, 0, 255, 0.4)`;
                ctx.lineWidth = 2;
                ctx.stroke();

                // Charging animation at staff tip
                const maxTimer = 120;
                const chargeRatio = 1 - (this.state.timer / maxTimer);

                // Growing energy ball at tip
                ctx.beginPath();
                ctx.arc(staffTipX, staffTipY, 15 * chargeRatio + Math.random() * 4, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + chargeRatio * 0.5})`;
                ctx.shadowColor = '#FF00FF';
                ctx.shadowBlur = 15;
                ctx.fill();
                ctx.shadowBlur = 0;

                // Shrinking ring effect at tip
                const ringPhase = (this.state.timer % 30) / 30;
                ctx.beginPath();
                ctx.arc(staffTipX, staffTipY, 40 * ringPhase, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 0, 255, ${ringPhase})`;
                ctx.lineWidth = 2;
                ctx.stroke();

            } else if (this.state.mode === 'firing') {
                const currentLaserLength = Math.min(1200, (180 - this.state.timer) * 40);
                if (frameCount % 6 < 3) { // Blinking
                    const lx = staffTipX + Math.cos(this.state.angle) * currentLaserLength;
                    const ly = staffTipY + Math.sin(this.state.angle) * currentLaserLength;

                    ctx.beginPath();
                    ctx.moveTo(staffTipX, staffTipY);
                    ctx.lineTo(lx, ly);
                    ctx.strokeStyle = `rgba(255, 0, 255, 0.8)`;
                    ctx.lineWidth = 20 + Math.random() * 5;
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(staffTipX, staffTipY);
                    ctx.lineTo(lx, ly);
                    ctx.strokeStyle = `#fff`;
                    ctx.lineWidth = 8;
                    ctx.stroke();
                }
            }

            // Draw Staff
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(staffAngle);
            ctx.drawImage(staffImg, -10, -5, 85, 55); // เธเธฃเธฑเธ Staff เธ—เธตเนเธ–เธทเธญ
            ctx.restore();
        }

        // Dash aim line for Charger
        if (this.type === 3 && this.state.mode === 'aiming') {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            const lx = this.x + Math.cos(this.state.angle) * 1000;
            const ly = this.y + Math.sin(this.state.angle) * 1000;
            ctx.lineTo(lx, ly);
            ctx.strokeStyle = `rgba(136, 85, 255, 0.4)`;
            ctx.lineWidth = 1 + (this.state.timer % 10 > 5 ? 2 : 0); // Blink
            ctx.stroke();
        }

        // Bomb pulsating logic
        if (this.type === 2 && this.state.mode === 'exploding') {
            const pulsate = Math.sin(this.state.explodeTimer) * 2;
            const imgSize = (this.radius + pulsate) * 3.75;

            ctx.save();
            ctx.translate(this.x, this.y);
            if (!(player.x < this.x)) {
                ctx.scale(-1, 1);
            }

            if (enemyImages[2] && enemyImages[2].complete && enemyImages[2].naturalWidth > 0) {
                ctx.drawImage(enemyImages[2], -imgSize / 2, -imgSize / 2, imgSize, imgSize);
            }
            if (frameCount % 6 < 3) {
                ctx.globalAlpha = 0.5;
                ctx.beginPath();
                ctx.arc(0, 0, this.radius + pulsate, 0, Math.PI * 2);
                ctx.fillStyle = "#ffffff";
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }
            ctx.restore();

            const blastRadius = 130;
            const maxTimer = 60;
            const progress = 1 - (this.state.explodeTimer / maxTimer); // from 0 to 1

            // Draw blast radius outline
            ctx.beginPath();
            ctx.arc(this.x, this.y, blastRadius, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(255, 170, 0, 0.5)";
            ctx.lineWidth = 2;
            ctx.stroke();

            // Inner growing fill circle indicating time left
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + (blastRadius - this.radius) * progress, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 170, 0, 0.3)";
            ctx.fill();
        } else {
            // Standard draw
            let imgSize = this.radius * 3.75;
            if (this.type === 4) {
                imgSize *= 1.5;
            }
            ctx.save();
            ctx.translate(this.x, this.y);

            const isFacingLeft = player.x < this.x;
            if (!isFacingLeft) {
                ctx.scale(-1, 1);
            }

            if (enemyImages[this.type] && enemyImages[this.type].complete && enemyImages[this.type].naturalWidth > 0) {
                ctx.drawImage(enemyImages[this.type], -imgSize / 2, -imgSize / 2, imgSize, imgSize);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
            ctx.restore();

            // Artillery charging animation
            if (this.type === 5 && this.state.cooldown <= 45) {
                const ratio = this.state.cooldown / 45; // 1 down to 0

                // Sweeping radar/shrink ring
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius + ratio * 20, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 255, 0, ${1 - ratio})`;
                ctx.lineWidth = 3;
                ctx.stroke();

                // Flashing core
                if (frameCount % 6 < 3) {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius * 0.7, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(255, 255, 0, 0.9)";
                    ctx.fill();
                }
            }

            // Curved dashed red line from side of Mage(Caster) to edge of each active AOE marker
            if (this.type === 5 && aoeMarkers.length > 0) {
                ctx.save();
                ctx.setLineDash([8, 6]);
                ctx.lineWidth = 1.8;
                aoeMarkers.forEach(aoe => {
                    const alpha = 0.3 + (aoe.timer / aoe.maxTimer) * 0.6;
                    ctx.strokeStyle = `rgba(255, 50, 50, ${alpha})`;

                    // Direction from enemy to AOE center
                    const dx = aoe.x - this.x;
                    const dy = aoe.y - this.y;
                    const dist = Math.hypot(dx, dy);
                    const nx = dx / dist; // normalized
                    const ny = dy / dist;

                    // Start: side of enemy (perpendicular to direction toward AOE)
                    const startX = this.x - ny * this.radius;
                    const startY = this.y + nx * this.radius;

                    // End: edge of the AOE circle facing enemy
                    const edgeX = aoe.x - nx * aoe.radius;
                    const edgeY = aoe.y - ny * aoe.radius;

                    // Control point: arc outward from midpoint
                    const midX = (startX + edgeX) / 2;
                    const midY = (startY + edgeY) / 2;
                    const perpX = midX - ny * dist * 0.25;
                    const perpY = midY + nx * dist * 0.25;

                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.quadraticCurveTo(perpX, perpY, edgeX, edgeY);
                    ctx.stroke();
                });
                ctx.setLineDash([]);
                ctx.restore();
            }
        }

        // Draw Bow for Shooter
        if (this.type === 4) {
            const bowAngle = getAngle(this.x, this.y, player.x, player.y);
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(bowAngle + Math.PI / -4);
            if (bowImg && bowImg.complete && bowImg.naturalWidth > 0) {
                ctx.drawImage(bowImg, 4, 3, 40, 50);
            }
            ctx.restore();

            // If aiming, draw the loaded arrow
            if (this.state.aiming) {
                const bowX = this.x + Math.cos(bowAngle) * 20;
                const bowY = this.y + Math.sin(bowAngle) * 20;
                ctx.save();
                ctx.translate(bowX, bowY);
                // Matches the exact rotate/drawImage used in Bullet.draw so it looks identical
                ctx.rotate(bowAngle - Math.PI / 70);
                if (arrowImg && arrowImg.complete && arrowImg.naturalWidth > 0) {
                    ctx.drawImage(arrowImg, 10, -100, 50, 200);
                }
                ctx.restore();
                if (window.currentVolume > 0) arrowSound.play();
            }
        }

        // Draw Swordsman's sword
        if (this.type === 9) {
            let drawAngle = 0;
            if (this.state.mode === 'prepare_swing' || this.state.mode === 'swinging') {
                drawAngle = this.state.currentAngle;
            } else {
                drawAngle = getAngle(this.x, this.y, player.x, player.y) + Math.PI / 6;
            }

            // Render sword using image
            ctx.save();
            ctx.translate(this.x, this.y);


            if (Math.abs(drawAngle) > Math.PI / 2) {
                ctx.scale(1, -1);
            }

            // Adjust rotation for a typical diagonally top-right pointing sword image
            ctx.rotate(Math.PI / 4);

            // Draw the sword so its bottom-left (handle) is at the center of the enemy
            if (swordImg && swordImg.complete && swordImg.naturalWidth > 0) {
                ctx.drawImage(swordImg, 0, -60, 60, 60);
            }
            ctx.restore();

            if (this.state.mode === 'prepare_swing') {
                // Flash indication on self
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius + 4, 0, Math.PI * 2);
                ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
                ctx.lineWidth = 2;
                ctx.stroke();
            } else if (this.state.mode === 'swinging') {
                // Draw sword sweep trail (arc)
                ctx.beginPath();
                let startArc = this.state.baseAngle - (this.state.swingSign * Math.PI / 1.5);
                ctx.arc(this.x, this.y, 75, startArc, this.state.currentAngle, this.state.swingSign === -1);
                ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
                ctx.lineWidth = 12;
                ctx.stroke();
                if (window.currentVolume > 0) swingsword.play();
            }
        }

        // Aura for buffed targets
        if (this.isBuffed) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 6 + Math.sin(frameCount * 0.1) * 3, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 0, 0, 0.8)`;
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // Mage lines pointing to buff targets
        if (this.type === 8 && this.state.targets) {
            ctx.strokeStyle = `rgba(255, 0, 0, 0.5)`;
            ctx.lineWidth = 2;
            this.state.targets.forEach(t => {
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(t.x, t.y);
                ctx.stroke();

                // Pulses flowing towards target
                const phase = (frameCount % 30) / 30;
                const px = this.x + (t.x - this.x) * phase;
                const py = this.y + (t.y - this.y) * phase;
                ctx.beginPath();
                ctx.arc(px, py, 4, 0, Math.PI * 2);
                ctx.fillStyle = "#FF0000";
                ctx.fill();
            });
        }

        // Draw HP bar
        drawEntityHPBar(ctx, this.x, this.y, this.radius, this.hp, this.maxHp, false);
    }
}

class Boss extends Enemy {
    constructor(x, y, type, id = null) {
        super(x, y, type, id);
    }

    init(type) {
        if (type === 10) {
            this.hp = 250; this.maxHp = 250;
            this.speed = 0.25;
            this.radius = 30;
            this.state = { spawnCooldown: 120, attackCooldown: 60 };
        } else if (type === 11) {
            this.hp = 300; this.maxHp = 300;
            this.speed = 0.2;
            this.radius = 28;
            this.state = { mode: 'idle', timer: 120, targetAngles: [], angle: 0 };
        } else if (type === 12) {
            this.hp = 450; this.maxHp = 450;
            this.speed = 0.4;
            this.radius = 32;
            this.state = {
                mode: 'chase',
                timer: 100,
                angle: 0,
                targetX: 0,
                targetY: 0,
                trail: [],
                dashCount: 0,
                isEnraged: false
            };
        } else if (type === 13) {
            this.hp = 250; this.maxHp = 250;
            this.speed = 0.3; this.radius = 45;
            this.state = { mode: 'chase', timer: 120 };
        } else if (type === 14) { // Earth Titan
            this.hp = 600; this.maxHp = 600;
            this.speed = 0.25; this.radius = 50;
            this.state = { mode: 'chase', timer: 60, targetAngle: 0, swingProgress: 0 };
        } else if (type === 131) { // Melee
            this.hp = 80; this.maxHp = 80; this.speed = 0.65; this.radius = 16;
            this.color = "#FF3333"; // Red
            this.state = { mode: 'chase', chargeCooldown: 60 };
        } else if (type === 132) { // Shooter
            this.hp = 80; this.maxHp = 80; this.speed = 0.5; this.radius = 16;
            this.color = "#33AAFF"; // Blue
            this.state = { mode: 'shoot', distance: 200, cooldown: 60, burstCount: 0, burstTimer: 0 };
        } else if (type === 133) { // Dasher
            this.hp = 80; this.maxHp = 80; this.speed = 0.4; this.radius = 18;
            this.color = "#FF00FF"; // Neon Pink/Purple
            this.state = { mode: 'prepare', timer: 60, angle: 0 };
        } else if (type === 134) { // Artillery
            this.hp = 80; this.maxHp = 80; this.speed = 0.3; this.radius = 16;
            this.color = "#33FF33"; // Green
            this.state = { cooldown: 90 };
        }
    }

    update() {
        if (this.dead) return;

        if (this.hitTimer > 0) this.hitTimer--;
        if (this.hp <= 0 && !this.dead) {
            this.dead = true;
            if (this.onDeath) this.onDeath();

            // Give reward when boss dies (Autoritative: only Host/Single Player awards XP/Coins)
            let isHostOrOffline = false;
            try {
                if (typeof netMode === 'undefined' || netMode !== 'join') isHostOrOffline = true;
            } catch (e) {
                isHostOrOffline = true;
            }
            if (isHostOrOffline) {
                const reward = enemyRewards[this.type] || { xp: 10, coin: 10 };
                if (typeof gameLogic !== 'undefined' && gameLogic.levelManager) {
                    if (reward.xp > 0) gameLogic.levelManager.spawnXP(this.x, this.y, reward.xp);
                    if (reward.coin > 0) gameLogic.levelManager.spawnCoin(this.x, this.y, reward.coin);
                }
            }
            return;
        }

        let target = player;
        if (typeof player2 !== 'undefined' && player2 && player2.active) {
            const dist1 = getDist(this.x, this.y, player.x, player.y);
            const dist2 = getDist(this.x, this.y, player2.x, player2.y);
            if (player.isDead || (!player2.isDead && dist2 < dist1)) {
                target = player2;
            }
        }
        if (target.isDead && typeof player2 !== 'undefined' && player2 && player2.active && !player2.isDead) {
            target = target === player ? player2 : player;
        }

        const distToPlayer = getDist(this.x, this.y, target.x, target.y);
        const angleToPlayer = getAngle(this.x, this.y, target.x, target.y);

        if (this.type === 10) {
            // Maintain distance from player
            if (distToPlayer > 350) {
                // this.x += Math.cos(angleToPlayer) * this.speed;
                // this.y += Math.sin(angleToPlayer) * this.speed;
                axialMove(this, angleToPlayer, this.speed);
            } else if (distToPlayer < 250) {
                // this.x -= Math.cos(angleToPlayer) * this.speed;
                // this.y -= Math.sin(angleToPlayer) * this.speed;
                axialMove(this, angleToPlayer, -this.speed);
            }
            // this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
            // this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));

            // Spawn Chaser minions
            if (this.state.spawnCooldown > 0) this.state.spawnCooldown--;
            else {
                const e1 = new Enemy(this.x - 40, this.y + 40, 1);
                const e2 = new Enemy(this.x + 40, this.y + 40, 1);
                enemies.push(e1, e2);
                this.state.spawnCooldown = 300; // Spawn every 5 seconds
            }

            if (this.state.attackCooldown > 0) this.state.attackCooldown--;
            else {
                const activeBullets = bullets.filter(b => b.owner === 10 && b.active).length;
                if (activeBullets < 4) {
                    const lifetime = 180; // ~3วินาที = ระยะยาวขึ้นมาก
                    bullets.push(new Bullet(this.x, this.y, angleToPlayer + Math.PI / 4, 4, 8, this.color, -0.02, 10, null, lifetime));
                    bullets.push(new Bullet(this.x, this.y, angleToPlayer - Math.PI / 4, 4, 8, this.color, 0.02, 10, null, lifetime));
                }
                this.state.attackCooldown = 120; // Attack every 2 seconds
            }

        } else if (this.type === 11) {
            // Maintain distance calmly
            if (distToPlayer > 400) {
                // this.x += Math.cos(angleToPlayer) * this.speed;
                // this.y += Math.sin(angleToPlayer) * this.speed;
                axialMove(this, angleToPlayer, this.speed);
            } else if (distToPlayer < 300) {
                // this.x -= Math.cos(angleToPlayer) * this.speed;
                // this.y -= Math.sin(angleToPlayer) * this.speed;
                axialMove(this, angleToPlayer, -this.speed);
            }
            // this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
            // this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));

            // Turn slowly and calmly, but track faster while charging laser
            let turnSpeed = (this.state.mode === 'cast_prepare') ? 0.05 : 0.02;
            let diff = angleToPlayer - this.state.angle;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            this.state.angle += Math.sign(diff) * Math.min(Math.abs(diff), turnSpeed);

            if (this.state.mode === 'idle') {
                this.state.timer--;
                if (this.state.timer <= 0) {
                    this.state.mode = 'rapid_firing';
                    this.state.timer = 50;
                }
            } else if (this.state.mode === 'rapid_firing') {
                this.state.timer--;

                if (this.state.timer % 25 === 0) {
                    const leftX = this.x + Math.cos(this.state.angle + Math.PI * 0.75) * 70;
                    const leftY = this.y + Math.sin(this.state.angle + Math.PI * 0.75) * 70;
                    const rightX = this.x + Math.cos(this.state.angle - Math.PI * 0.75) * 70;
                    const rightY = this.y + Math.sin(this.state.angle - Math.PI * 0.75) * 70;

                    const angL = getAngle(leftX, leftY, target.x, target.y) - 0.2;
                    const angR = getAngle(rightX, rightY, target.x, target.y) + 0.2;

                    // Shoot with slight outward offset and curve inward
                    bullets.push(new Bullet(leftX, leftY, angL, 3.5, 4, "#FFFFFF", 0.005, 11));
                    bullets.push(new Bullet(rightX, rightY, angR, 3.5, 4, "#FFFFFF", -0.005, 11));
                }

                if (this.state.timer <= 0) {
                    this.state.mode = 'cast_prepare';
                    this.state.timer = 180; // 3 seconds calm telegraph
                    if (window.currentVolume > 0) chargeSound.play();
                    this.state.targetAngles = [ // Array of angles
                        angleToPlayer
                    ];
                }
            } else if (this.state.mode === 'cast_prepare') {
                this.state.timer--;

                // Continuously shoot bullets until 0.5s (30 frames) before firing
                if (this.state.timer > 30) {
                    if (this.state.timer % 25 === 0) {
                        const leftX = this.x + Math.cos(this.state.angle + Math.PI * 0.75) * 70;
                        const leftY = this.y + Math.sin(this.state.angle + Math.PI * 0.75) * 70;
                        const rightX = this.x + Math.cos(this.state.angle - Math.PI * 0.75) * 70;
                        const rightY = this.y + Math.sin(this.state.angle - Math.PI * 0.75) * 70;

                        const angL = getAngle(leftX, leftY, target.x, target.y) - 0.2;
                        const angR = getAngle(rightX, rightY, target.x, target.y) + 0.2;

                        bullets.push(new Bullet(leftX, leftY, angL, 3.5, 4, "#FFFFFF", 0.005, 11));
                        bullets.push(new Bullet(rightX, rightY, angR, 3.5, 4, "#FFFFFF", -0.005, 11));
                    }
                }

                // Continuously update tracking perfectly until the last fraction of a second
                if (this.state.timer > 15) {
                    this.state.targetAngles = [this.state.angle];
                }

                if (this.state.timer <= 0) {
                    this.state.mode = 'firing';
                    this.state.timer = 60; // Instantaneous feeling but stays for ~0.5s for effects
                    if (window.currentVolume > 0) laserSound.play();
                }
            } else if (this.state.mode === 'firing') {
                this.state.timer--;

                const laserLength = 1500;
                if (this.state.timer > 15) { // Deal damage early in the beam
                    this.state.targetAngles.forEach(ang => {
                        const lx = this.x + Math.cos(ang) * laserLength;
                        const ly = this.y + Math.sin(ang) * laserLength;
                        if (Math.sqrt(pbDistSquare(target.x, target.y, this.x, this.y, lx, ly)) < target.radius + 30) {
                            dealDamageToTarget(target, 1);
                        }
                    });
                }

                if (this.state.timer <= 0) {
                    this.state.mode = 'idle';
                    this.state.timer = 150; // Wait 2.5 seconds calmly
                }
            }

            // Melee Body Collision
            if (distToPlayer < this.radius + target.radius) {
                dealDamageToTarget(target, 1);
            }
        } else if (this.type === 12) {
            // Update Trail
            if (this.state.trail) {
                this.state.trail.push({ x: this.x, y: this.y, opacity: 0.6 });
                if (this.state.trail.length > 15) this.state.trail.shift();
            }

            // Enraged Check
            if (this.hp < this.maxHp * 0.5 && !this.state.isEnraged) {
                this.state.isEnraged = true;
                this.color = "#FF3366"; // Shift to neon red/pink

            }

            if (this.state.mode === 'chase') {
                // Move towards player
                const moveSpeed = this.state.isEnraged ? this.speed * 1.5 : this.speed;
                // this.x += Math.cos(angleToPlayer) * moveSpeed;
                // this.y += Math.sin(angleToPlayer) * moveSpeed;
                axialMove(this, angleToPlayer, moveSpeed);
                this.state.timer--;
                if (this.state.timer <= 0) {
                    this.state.mode = 'prepare';
                    this.state.timer = this.state.isEnraged ? 40 : 70; // Faster charge when enraged
                    if (window.currentVolume > 0) chargeSound.play();
                }
            } else if (this.state.mode === 'prepare') {
                // Track player
                this.state.angle = angleToPlayer;
                this.state.timer--;
                if (this.state.timer <= 0) {
                    this.state.mode = 'dash';
                    this.state.timer = 20;
                    this.state.dashCount++;
                    if (dashenemy && window.currentVolume > 0) { dashenemy.play(); }


                    // Spawn skeleton, max 5
                    const skeletonCount = enemies.filter(e => e.type === 9 && !e.dead).length;
                    if (skeletonCount < 5) {
                        enemies.push(new Enemy(this.x, this.y, 9));
                    }
                }
            } else if (this.state.mode === 'dash') {
                const dashSpeed = this.state.isEnraged ? 24 : 18;
                // this.x += Math.cos(this.state.angle) * dashSpeed;
                // this.y += Math.sin(this.state.angle) * dashSpeed;
                axialMove(this, this.state.angle, dashSpeed);

                if (getDist(this.x, this.y, target.x, target.y) < this.radius + target.radius) {
                    dealDamageToTarget(target, this.state.isEnraged ? 1 : 1);

                }

                this.state.timer--;
                if (this.state.timer <= 0) {
                    // Combo logic
                    const maxDashes = this.state.isEnraged ? 3 : 1;
                    if (this.state.dashCount < maxDashes) {
                        this.state.mode = 'prepare';
                        this.state.timer = 15; // Quick reposition for next dash
                    } else {
                        this.state.mode = 'recover';
                        this.state.timer = this.state.isEnraged ? 40 : 70;
                        this.state.dashCount = 0;
                    }
                }
            } else if (this.state.mode === 'recover') {
                this.state.timer--;
                if (this.state.timer <= 0) {
                    this.state.mode = 'chase';
                    this.state.timer = this.state.isEnraged ? 60 : 120;
                }
            }

            // Default collision
            if (distToPlayer < this.radius + target.radius) {
                dealDamageToTarget(target, 1);
            }

            // Constrain
            // this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
            // this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
        } else if (this.type === 13) {
            // this.x += Math.cos(angleToPlayer) * this.speed;
            // this.y += Math.sin(angleToPlayer) * this.speed;
            axialMove(this, angleToPlayer, this.speed);
            this.state.timer--;
            if (this.state.timer <= 0) {
                for (let i = 0; i < 8; i++) {
                    bullets.push(new Bullet(this.x, this.y, (Math.PI * 2 / 8) * i, 3, 6, this.color, 0, 13));
                }
                this.state.timer = 120;
                if (window.currentVolume > 0) bombSound.play();
            }
            if (distToPlayer < this.radius + target.radius) dealDamageToTarget(target, 1);
            // this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
            // this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
        } else if (this.type === 14) {
            if (this.state.mode === 'chase') {
                // this.x += Math.cos(angleToPlayer) * this.speed;
                // this.y += Math.sin(angleToPlayer) * this.speed;
                axialMove(this, angleToPlayer, this.speed);
                this.state.timer--;


                if (this.state.timer <= 0) {
                    this.state.mode = 'prepare_swing';
                    this.state.timer = 60; // 1s warning
                    this.state.targetAngle = angleToPlayer; // Lock angle
                    if (window.currentVolume > 0) chargeSound.play();
                }
            } else if (this.state.mode === 'prepare_swing') {
                // Turning slowly to the player
                let diff = angleToPlayer - this.state.targetAngle;
                while (diff < -Math.PI) diff += Math.PI * 2;
                while (diff > Math.PI) diff -= Math.PI * 2;
                this.state.targetAngle += Math.sign(diff) * Math.min(Math.abs(diff), 0.05);

                this.state.timer--;
                if (this.state.timer <= 0) {
                    this.state.mode = 'swinging';
                    this.state.timer = 15; // fast downward swing
                    this.state.swingProgress = 0;
                    if (swingsword && window.currentVolume > 0) { swingsword.play(); }
                }
            } else if (this.state.mode === 'swinging') {
                this.state.timer--;

                if (this.state.timer <= 0) {
                    this.state.mode = 'landed';
                    this.state.timer = 75; // recovery time

                    const smashDist = this.radius + 130;
                    const smashX = this.x + Math.cos(this.state.targetAngle) * smashDist;
                    const smashY = this.y + Math.sin(this.state.targetAngle) * smashDist;

                    const blastRadius = 100;
                    const distToSmash = getDist(smashX, smashY, target.x, target.y);
                    if (distToSmash < blastRadius + target.radius) {
                        dealDamageToTarget(target, 1);
                    }

                    if (window.currentVolume > 0) bombSound.play();
                }
            } else if (this.state.mode === 'landed') {
                this.state.timer--;
                if (this.state.timer <= 0) {
                    this.state.mode = 'chase';
                    this.state.timer = 240; // 4 seconds of chasing before next smash
                }
            }
            // this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
            // this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
        } else if (this.type === 131) { // Melee - Lunging
            if (this.state.mode === 'chase') {
                // this.x += Math.cos(angleToPlayer) * this.speed;
                // this.y += Math.sin(angleToPlayer) * this.speed;
                axialMove(this, angleToPlayer, this.speed);
                this.state.chargeCooldown--;
                if (this.state.chargeCooldown <= 0) {
                    this.state.mode = 'lunge';
                    this.state.lungeTimer = 15;
                    this.state.angle = angleToPlayer;
                }
            } else if (this.state.mode === 'lunge') {
                // this.x += Math.cos(this.state.angle) * (this.speed * 2.5);
                // this.y += Math.sin(this.state.angle) * (this.speed * 2.5);
                axialMove(this, this.state.angle, this.speed * 2.5);
                this.state.lungeTimer--;
                if (getDist(this.x, this.y, target.x, target.y) < this.radius + target.radius) {
                    dealDamageToTarget(target, 1);
                    this.state.mode = 'chase';
                    this.state.chargeCooldown = 150;
                } else if (this.state.lungeTimer <= 0) {
                    this.state.mode = 'chase';
                    this.state.chargeCooldown = 150;
                }
            }
            if (distToPlayer < this.radius + target.radius && this.state.mode === 'chase') dealDamageToTarget(target, 1);
            // this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
            // this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
        } else if (this.type === 132) { // Shooter - Burst Fire
            if (distToPlayer > this.state.distance + 50) {
                // this.x += Math.cos(angleToPlayer) * this.speed;
                // this.y += Math.sin(angleToPlayer) * this.speed;
                axialMove(this, angleToPlayer, this.speed);
            } else if (distToPlayer < this.state.distance - 50) {
                // this.x -= Math.cos(angleToPlayer) * this.speed;
                // this.y -= Math.sin(angleToPlayer) * this.speed;
                axialMove(this, angleToPlayer, -this.speed);
            }

            if (this.state.mode === 'shoot') {
                if (this.state.cooldown > 0) this.state.cooldown--;
                else {
                    this.state.mode = 'burst';
                    this.state.burstCount = 2;
                    this.state.burstTimer = 0;
                }
            } else if (this.state.mode === 'burst') {
                this.state.burstTimer--;
                if (this.state.burstTimer <= 0) {
                    bullets.push(new Bullet(this.x, this.y, angleToPlayer, 3.5, 5, this.color, 0, 132));
                    this.state.burstCount--;
                    this.state.burstTimer = 10;
                    if (this.state.burstCount <= 0) {
                        this.state.mode = 'shoot';
                        this.state.cooldown = 180;
                    }
                }
            }
            if (distToPlayer < this.radius + target.radius) dealDamageToTarget(target, 1);
            // this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
            // this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
        } else if (this.type === 133) { // Dasher - Bullet Dropper
            if (this.state.mode === 'prepare') {
                this.state.angle = angleToPlayer;
                this.state.timer--;
                if (this.state.timer <= 0) {
                    this.state.mode = 'dash';
                    this.state.timer = 18;
                    if (dashenemy && window.currentVolume > 0) { dashenemy.play(); }
                }
            } else if (this.state.mode === 'dash') {
                // this.x += Math.cos(this.state.angle) * 12;
                // this.y += Math.sin(this.state.angle) * 12;
                axialMove(this, this.state.angle, 12);

                this.state.timer--;
                if (getDist(this.x, this.y, target.x, target.y) < this.radius + target.radius) dealDamageToTarget(target, 1);
                if (this.state.timer <= 0) {
                    this.state.mode = 'prepare';
                    this.state.timer = 120;
                }
            }
            // this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
            // this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
        } else if (this.type === 134) { // Artillery - Single Bomb
            // this.x += Math.cos(angleToPlayer) * this.speed * 0.6;
            // this.y += Math.sin(angleToPlayer) * this.speed * 0.6;
            axialMove(this, angleToPlayer, this.speed * 0.6);

            if (this.state.cooldown > 0) this.state.cooldown--;
            else {
                aoeMarkers.push({ x: player.x, y: player.y, radius: 80, timer: 0, maxTimer: 120 });
                this.state.cooldown = 200;
            }
            if (distToPlayer < this.radius + target.radius) dealDamageToTarget(target, 1);
            // this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
            // this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
        }
    }

    onDeath() {
        if (this.type === 13) {
            enemies.push(new Boss(this.x - 40, this.y - 40, 131));
            enemies.push(new Boss(this.x + 40, this.y - 40, 132));
            enemies.push(new Boss(this.x - 40, this.y + 40, 133));
            enemies.push(new Boss(this.x + 40, this.y + 40, 134));
        }
    }

    draw(ctx) {
        if (this.dead) return;


        if (this.type === 10) {
            const angleToPlayer = getAngle(this.x, this.y, player.x, player.y);
            const imgSize = this.radius * 3.75;

            // 👉 ดึงเฟรมเดิน
            const walkImg = getBossWalkImage(this);

            ctx.save();
            ctx.translate(this.x, this.y);

            if (Math.abs(angleToPlayer) > Math.PI / 2) {
                ctx.scale(-1, 1);
            }

            if (walkImg && walkImg.complete && walkImg.naturalWidth > 0) {
                // ✅ ใช้อนิเมชันเดิน
                ctx.drawImage(walkImg, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
            } else if (bossImages[10] && bossImages[10].complete && bossImages[10].naturalWidth > 0) {
                // fallback รูปนิ่ง
                ctx.drawImage(bossImages[10], -imgSize / 2, -imgSize / 2, imgSize, imgSize);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }

            ctx.restore();
        } else if (this.type === 11) {
            const aimAngle = getAngle(this.x, this.y, player.x, player.y);
            const imgSize = this.radius * 4;

            const walkImg = getBossWalkImage(this);

            ctx.save();
            ctx.translate(this.x, this.y);

            if (Math.abs(aimAngle) > Math.PI / 2) {
                ctx.scale(-1, 1);
            }

            if (walkImg && walkImg.complete && walkImg.naturalWidth > 0) {
                ctx.drawImage(walkImg, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
            } else if (bossImages[11] && bossImages[11].complete && bossImages[11].naturalWidth > 0) {
                ctx.drawImage(bossImages[11], -imgSize / 2, -imgSize / 2, imgSize, imgSize);
            }

            ctx.restore();

            // Two floating side orbs (behind the boss)
            const leftOrbX = this.x + Math.cos(this.state.angle + Math.PI * 0.75) * 70;
            const leftOrbY = this.y + Math.sin(this.state.angle + Math.PI * 0.75) * 70;
            const rightOrbX = this.x + Math.cos(this.state.angle - Math.PI * 0.75) * 70;
            const rightOrbY = this.y + Math.sin(this.state.angle - Math.PI * 0.75) * 70;

            // Left Magic Circle
            if (magicCircleImg && magicCircleImg.complete && magicCircleImg.naturalWidth > 0) {
                ctx.save();
                ctx.translate(leftOrbX, leftOrbY);
                ctx.drawImage(magicCircleImg, -20, -20, 40, 40);
                ctx.restore();
            }

            // Right Magic Circle
            if (magicCircleImg && magicCircleImg.complete && magicCircleImg.naturalWidth > 0) {
                ctx.save();
                ctx.translate(rightOrbX, rightOrbY);
                ctx.drawImage(magicCircleImg, -20, -20, 40, 40);
                ctx.restore();
            }





            // Staff at calm angle
            const staffAngle = this.state.angle;
            const staffTipX = this.x + Math.cos(staffAngle) * 45;
            const staffTipY = this.y + Math.sin(staffAngle) * 45;

            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(staffAngle);

            if (Math.abs(staffAngle) > Math.PI / 2) {
                ctx.scale(1, -1);
            }

            if (staffImg && staffImg.complete && staffImg.naturalWidth > 0) {
                ctx.drawImage(staffImg, -10, -5, 85, 55);
            }
            ctx.restore();


            if (this.state.mode === 'rapid_firing' || (this.state.mode === 'cast_prepare' && this.state.timer > 30)) {
                // Straight lines pointing to player
                ctx.save();
                ctx.setLineDash([8, 8]);
                const phase = (frameCount * 2) % 16;
                ctx.lineDashOffset = -phase;
                ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
                ctx.lineWidth = 1.5;

                // Left indicator
                ctx.beginPath();
                ctx.moveTo(leftOrbX, leftOrbY);
                ctx.lineTo(player.x, player.y);
                ctx.stroke();

                // Right indicator
                ctx.beginPath();
                ctx.moveTo(rightOrbX, rightOrbY);
                ctx.lineTo(player.x, player.y);
                ctx.stroke();

                ctx.restore();
            }

            if (this.state.mode === 'cast_prepare') {
                const maxTimer = 180;
                const chargeRatio = 1 - (this.state.timer / maxTimer);

                // Beautiful expanding and rotating rings
                ctx.save();
                ctx.translate(staffTipX, staffTipY);
                ctx.rotate(frameCount * 0.1);
                ctx.beginPath();
                ctx.arc(0, 0, 40 * chargeRatio, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 255, 255, ${chargeRatio})`;
                ctx.lineWidth = 2;
                ctx.setLineDash([10, 15, 5, 10]);
                ctx.stroke();
                ctx.restore();

                ctx.save();
                ctx.translate(staffTipX, staffTipY);
                ctx.rotate(-frameCount * 0.05);
                ctx.beginPath();
                ctx.arc(0, 0, 25 * chargeRatio, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(200, 230, 255, ${chargeRatio})`;
                ctx.lineWidth = 3;
                ctx.setLineDash([15, 10]);
                ctx.stroke();
                ctx.restore();

                // Converging energy particles simulation
                for (let p = 0; p < 6; p++) {
                    const pAngle = (frameCount * 0.05) + (p * Math.PI / 3);
                    const pDist = 60 * (1 - chargeRatio);
                    if (pDist > 5) {
                        ctx.beginPath();
                        ctx.arc(staffTipX + Math.cos(pAngle) * pDist, staffTipY + Math.sin(pAngle) * pDist, 3, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(255, 255, 255, ${chargeRatio})`;
                        ctx.fill();
                    }
                }

                // Core orb
                ctx.beginPath();
                ctx.arc(staffTipX, staffTipY, 10 + chargeRatio * 15, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${chargeRatio})`;
                ctx.shadowColor = "#FFF";
                ctx.shadowBlur = 20 * chargeRatio;
                ctx.fill();
                ctx.shadowBlur = 0;

                this.state.targetAngles.forEach(ang => {
                    ctx.beginPath();
                    ctx.moveTo(staffTipX, staffTipY);
                    ctx.lineTo(staffTipX + Math.cos(ang) * 1500, staffTipY + Math.sin(ang) * 1500);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * chargeRatio})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                });
            } else if (this.state.mode === 'firing') {
                const fadeRatio = this.state.timer / 35; // 1 -> 0
                this.state.targetAngles.forEach(ang => {
                    ctx.beginPath();
                    ctx.moveTo(staffTipX, staffTipY);
                    ctx.lineTo(staffTipX + Math.cos(ang) * 1500, staffTipY + Math.sin(ang) * 1500);

                    ctx.strokeStyle = `rgba(255, 255, 255, ${fadeRatio})`;
                    ctx.lineWidth = 40;
                    ctx.stroke();

                    ctx.strokeStyle = `rgba(200, 230, 255, ${fadeRatio * 0.5})`;
                    ctx.lineWidth = 65;
                    ctx.stroke();
                });

                // Blinding core light
                ctx.beginPath();
                ctx.arc(staffTipX, staffTipY, 25 * fadeRatio, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${fadeRatio})`;
                ctx.fill();
            }
        } else if (this.type === 12) {

            // Body
            const aimAngle12 = getAngle(this.x, this.y, player.x, player.y);
            let drawAngle12 = aimAngle12;

            if (this.state.mode === 'prepare' || this.state.mode === 'dash') {
                drawAngle12 = this.state.angle;
            }

            const imgSize12 = this.radius * 3.75;
            const isFacingLeft12 = Math.abs(drawAngle12) > Math.PI / 2;

            // 👉 เพิ่มตรงนี้
            const walkImg = getBossWalkImage(this);

            ctx.save();
            ctx.translate(this.x, this.y);

            if (isFacingLeft12) {
                ctx.scale(-1, 1);
            }

            // ✅ ใช้อนิเมชันเดินเฉพาะตอน "chase"
            if (this.state.mode === 'chase' && walkImg && walkImg.complete && walkImg.naturalWidth > 0) {
                ctx.drawImage(walkImg, -imgSize12 / 2, -imgSize12 / 2, imgSize12, imgSize12);
            }
            // ❗ ตอน dash / prepare ใช้รูปนิ่ง (จะดูแรงกว่า)
            else if (bossImages[12] && bossImages[12].complete && bossImages[12].naturalWidth > 0) {
                ctx.drawImage(bossImages[12], -imgSize12 / 2, -imgSize12 / 2, imgSize12, imgSize12);
            }
            else {
                ctx.beginPath();
                ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();

                const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
                gradient.addColorStop(0, '#fff');
                gradient.addColorStop(0.3, this.color);
                gradient.addColorStop(1, 'rgba(0, 255, 204, 0)');
                ctx.beginPath();
                ctx.arc(0, 0, this.radius * 0.8, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
            }

            ctx.restore();
        } else if (this.type === 14) {
            let drawY = this.y;
            let drawRadius = this.radius;

            // Draw shadow
            ctx.beginPath();
            ctx.ellipse(this.x, this.y, this.radius, this.radius * 0.4, 0, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
            ctx.fill();

            let aimAngle = getAngle(this.x, this.y, player.x, player.y);
            if (this.state.mode !== 'chase') {
                aimAngle = this.state.targetAngle;
            }

            if (this.state.mode === 'prepare_swing') {
                const smashDist = this.radius + 130;
                const smashX = this.x + Math.cos(this.state.targetAngle) * smashDist;
                const smashY = this.y + Math.sin(this.state.targetAngle) * smashDist;

                ctx.beginPath();
                ctx.arc(smashX, smashY, 100, 0, Math.PI * 2);
                ctx.strokeStyle = "rgba(255, 60, 60, 0.8)";
                ctx.lineWidth = 3;
                ctx.setLineDash([15, 10]);
                ctx.stroke();
                ctx.setLineDash([]);

                // Flashing indication
                if (frameCount % 6 < 3) {
                    ctx.beginPath();
                    ctx.arc(this.x, drawY, drawRadius + 6, 0, Math.PI * 2);
                    ctx.strokeStyle = "rgba(255, 100, 100, 0.8)";
                    ctx.lineWidth = 3;
                    ctx.stroke();
                }
            } else if (this.state.mode === 'chase' && this.state.timer % 60 < 10) {
                // Stomp indicator
                const ratio = 1 - (this.state.timer % 60) / 10;
                ctx.beginPath();
                ctx.arc(this.x, drawY, drawRadius + 40 * ratio, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 200, 100, ${ratio})`;
                ctx.lineWidth = 3;
                ctx.stroke();
            }

            ctx.save();
            ctx.translate(this.x, drawY);

            let isFacingLeft = Math.abs(aimAngle) > Math.PI / 2;
            let flipSign = isFacingLeft ? -1 : 1;

            if (isFacingLeft) {

                ctx.scale(-1, 1);
            } else {

            }

            // เลือก sprite ตามสถานะการโจมตี
            let giantImg;
            if (this.state.mode === 'swinging' || this.state.mode === 'landed') {
                giantImg = bossImages['14_down']; // Giant down = ตอนตีแล้ว
            } else if (this.state.mode === 'prepare_swing') {
                giantImg = bossImages['14_up'];   // Giant up = ตอนเตรียมตี
            } else {
                giantImg = getBossWalkImage(this) || bossImages[14];       // Giant = ตอน chase ทั่วไป
            }

            if (giantImg && giantImg.complete && giantImg.naturalWidth > 0) {
                const sizeScale = (this.state.mode === 'chase') ? 0.75 : 1.0;
                const imgSize = this.radius * 3.75 * sizeScale;
                ctx.drawImage(giantImg, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
            } else {
                // Simple Titan Circle logic as fallback
                ctx.beginPath();
                ctx.arc(0, 0, drawRadius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();

                // Glowing Red Core
                ctx.beginPath();
                ctx.arc(0, 0, 10, 0, Math.PI * 2);
                ctx.fillStyle = "#FF3300";
                ctx.shadowColor = "#FF0000";
                ctx.shadowBlur = 10;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
            ctx.restore();

            // --- Draw Weapon Giant ---
            ctx.save();
            ctx.translate(this.x, this.y);

            let weaponAngle = aimAngle;

            if (this.state.mode === 'prepare_swing') {
                // Wind up weapon backwards
                weaponAngle -= flipSign * Math.PI / 2;
            } else if (this.state.mode === 'swinging') {
                // Swing from backward to forward smash
                let windup = -flipSign * Math.PI / 2;
                let swingTotal = flipSign * (Math.PI); // Full 180 degrees swing
                weaponAngle += windup + (swingTotal * this.state.swingProgress);
            } else if (this.state.mode === 'landed') {
                // Leave weapon down on the ground pointing forward for a bit
                weaponAngle += flipSign * (Math.PI / 2);
            } else {
                // Default holding pose
                weaponAngle -= flipSign * Math.PI / 6;
            }

            ctx.rotate(weaponAngle);
            if (isFacingLeft) {
                ctx.scale(1, -1);
            }

            if (typeof weaponGiantImg !== 'undefined' && weaponGiantImg.complete && weaponGiantImg.naturalWidth > 0) {
                ctx.rotate(Math.PI / 4);
                ctx.drawImage(weaponGiantImg, -50, -110, 100, 100);
            }
            ctx.restore();
        } else if (this.type === 13 || this.type === 131 || this.type === 132 || this.type === 133 || this.type === 134) {
            if (this.type === 133 && this.state.mode === 'prepare') {
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                const lx = this.x + Math.cos(this.state.angle) * 1500;
                const ly = this.y + Math.sin(this.state.angle) * 1500;
                ctx.lineTo(lx, ly);

                const alpha = 0.3 + (Math.sin(frameCount * 0.4) * 0.2);
                ctx.strokeStyle = `rgba(255, 0, 255, ${alpha})`; // Neon Pink matches Dasher color
                ctx.lineWidth = 3;
                ctx.setLineDash([15, 10]);
                ctx.stroke();
                ctx.restore();
            }

            // Draw Slime King image for Boss 4 (type 13) — same rotation logic as Titan
            if (this.type === 13) {
                const aimAngle = getAngle(this.x, this.y, player.x, player.y);
                const imgSize = this.radius * 3.75;
                const isFacingLeft = Math.abs(aimAngle) > Math.PI / 2;

                ctx.save();
                ctx.translate(this.x, this.y);

                if (isFacingLeft) {

                    ctx.scale(-1, 1);
                } else {

                }

                const walkImg13 = getBossWalkImage(this);
                const drawImg13 = walkImg13 || bossImages[13];
                if (drawImg13 && drawImg13.complete && drawImg13.naturalWidth > 0) {
                    ctx.drawImage(drawImg13, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
                } else {
                    ctx.beginPath();
                    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
                    ctx.fillStyle = this.color;
                    ctx.fill();
                }
                ctx.restore();
            } else {
                // Draw colored Slime images for mini-bosses (131-134)
                const aimAngle = getAngle(this.x, this.y, player.x, player.y);
                const imgSize = this.radius * 3.75;
                const isFacingLeft = Math.abs(aimAngle) > Math.PI / 2;

                ctx.save();
                ctx.translate(this.x, this.y);

                if (isFacingLeft) {

                    ctx.scale(-1, 1);
                } else {

                }

                const walkImgMini = getBossWalkImage(this);
                const drawImgMini = walkImgMini || bossImages[this.type];
                if (drawImgMini && drawImgMini.complete && drawImgMini.naturalWidth > 0) {
                    ctx.drawImage(drawImgMini, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
                } else {
                    ctx.beginPath();
                    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
                    ctx.fillStyle = this.color;
                    ctx.fill();
                }
                ctx.restore();
            }
        }
        // Draw Boss HP bar
        drawEntityHPBar(ctx, this.x, this.y, this.radius, this.hp, this.maxHp, true);
    }
}