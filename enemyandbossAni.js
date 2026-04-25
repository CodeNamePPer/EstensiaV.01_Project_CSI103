//SFX
const laserSound = new Audio('/sfx/Laser.mp3');
laserSound.volume = 0.2;
const chargeSound = new Audio('/sfx/ChargeLaser.mp3');
chargeSound.volume = 0.2;
const bombSound = new Audio('/sfx/bomb.mp3');
bombSound.volume = 0.2;
const arrowSound = new Audio('/sfx/ArrowSound.mp3');
arrowSound.volume = 0.2;
const swingsword = new Audio('/sfx/Swing.mp3');
swingsword.volume = 0.2;
const dashenemy = new Audio('/sfx/EnemyDash.mp3');
dashenemy.volume = 0.2;

//Img Boss&Enemy
const enemyImages = {};
for (let i = 1; i <= 9; i++) {
    enemyImages[i] = new Image();
}
enemyImages[1].src = 'img_enemy/1_Chaser.png';
enemyImages[2].src = 'img_enemy/2_bomber.png';
enemyImages[3].src = 'img_enemy/3_charger.png';
enemyImages[4].src = 'img_enemy/4_Archer.png';
enemyImages[5].src = 'img_enemy/5_mage.png';
enemyImages[6].src = 'img_enemy/6_Laser.png';
enemyImages[7].src = 'img_enemy/7_Slime.png';
enemyImages[8].src = 'img_enemy/8_Buffer.png';
enemyImages[9].src = 'img_enemy/9_skeleton.png';

const bossImages = {};
bossImages[10] = new Image();
bossImages[10].src = 'img_boss/Necromancer.png';
bossImages[11] = new Image();
bossImages[11].src = 'img_boss/AncientMage.png';
bossImages[12] = new Image();
bossImages[12].src = 'img_boss/Skeleton_king.png';
bossImages[13] = new Image();
bossImages[13].src = 'img_boss/Slime_king.png';
bossImages[131] = new Image();
bossImages[131].src = 'img_boss/Slime_red.png';
bossImages[132] = new Image();
bossImages[132].src = 'img_boss/Slime_blue.png';
bossImages[133] = new Image();
bossImages[133].src = 'img_boss/Slime_yellow.png';
bossImages[134] = new Image();
bossImages[134].src = 'img_boss/Slime_green.png';
bossImages[14] = new Image();
bossImages[14].src = 'img_boss/Giant.png';
bossImages['14_up'] = new Image();
bossImages['14_up'].src = 'img_boss/Giant_up.png';
bossImages['14_down'] = new Image();
bossImages['14_down'].src = 'img_boss/Giant_down.png';

// --- Walk Animation Frames ---
const bossWalkFrames = {};

const bossWalkDefs = [
    { id: 10, name: 'Necromancer' },
    { id: 11, name: 'AncientMage' },
    { id: 12, name: 'Skeleton_king' },
    { id: 13, name: 'Slime_king' },
    { id: 131, name: 'Slime_red' },
    { id: 132, name: 'Slime_blue' },
    { id: 133, name: 'Slime_yellow' },
    { id: 134, name: 'Slime_green' },
    { id: 14, name: 'Giant' },
];

bossWalkDefs.forEach(({ id, name }) => {
    bossWalkFrames[id] = [];
    for (let i = 1; i <= 4; i++) {
        const img = new Image();
        img.src = `img_boss/${name}_walk${i}.png`;
        bossWalkFrames[id].push(img);
    }
});

// คืน walk frame ถ้าบอสกำลังเดิน (chase/lunge) ไม่งั้นคืน null
function getBossWalkImage(boss) {
    const WALK_STATES = ['chase', 'lunge'];
    const isWalking = WALK_STATES.includes(boss.state.mode);
    if (!isWalking) return null;

    const frames = bossWalkFrames[boss.type];
    if (!frames || frames.length === 0) return null;

    const FRAME_SPEED = 30; // 60 FPS ÷ 4 FPS = 15 tick ต่อ frame
    const frameIndex = Math.floor(frameCount / FRAME_SPEED) % frames.length;
    const img = frames[frameIndex];
    return img && img.complete ? img : null;
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
class Enemy {
    constructor(x, y, type) {
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
            this.spawnTimer = 30;
        } else {
            this.spawnTimer = 0;
        }
    }

    init(type) {
        switch (type) {
            case 1:
                this.hp = 30; this.maxHp = 30;
                this.speed = 0.6;
                this.radius = 16;
                this.state = { mode: 'chase' };
                break;
            case 2:
                this.hp = 20; this.maxHp = 20;
                this.speed = 0.4;
                this.radius = 20;
                this.state = { mode: 'chase', explodeTimer: 0 };
                break;
            case 3:
                this.hp = 80; this.maxHp = 80;
                this.speed = 0;
                this.radius = 35;
                this.state = { mode: 'aiming', timer: 120, angle: Math.PI / 2, dashSpeed: 12 };
                break;
            case 4:
                this.hp = 20; this.maxHp = 20;
                this.speed = 0.5;
                this.radius = 16;
                this.state = { mode: 'chase', distance: 200, cooldown: 0 };
                break;
            case 5:
                this.hp = 25; this.maxHp = 25;
                this.speed = 0.45;
                this.radius = 18;
                this.state = { distance: 250, cooldown: 120 };
                break;
            case 6:
                this.hp = 25; this.maxHp = 25;
                this.speed = 0.3;
                this.radius = 16;
                this.state = { mode: 'chase', timer: 120, angle: 0 };
                break;
            case 7:
                this.hp = 40; this.maxHp = 40;
                this.speed = 0.5;
                this.radius = 20;
                this.state = { mode: 'chase', timer: 100, z: 0, vz: 0, targetX: 0, targetY: 0 };
                break;
            case 8:
                this.hp = 40; this.maxHp = 40;
                this.speed = 0.3;
                this.radius = 16;
                this.state = { targets: [] };
                break;
            case 9:
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
            return;
        }

        if (this.hitTimer > 0) this.hitTimer--;
        if (this.hp <= 0 && !this.dead) {
            this.dead = true;
            if (this.onDeath) this.onDeath();
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
            case 1:
                axialMove(this, angleToPlayer, this.speed);
                break;

            case 2:
                if (this.state.mode === 'chase') {
                    axialMove(this, angleToPlayer, this.speed);
                    if (distToPlayer < 80) {
                        this.state.mode = 'exploding';
                        this.state.explodeTimer = 60;
                    }
                } else if (this.state.mode === 'exploding') {
                    this.speed = 0;
                    this.state.explodeTimer--;
                    if (this.state.explodeTimer <= 0) {
                        this.explode();
                        bombSound.currentTime = 0;
                        bombSound.play();
                    }
                }
                break;

            case 3:
                if (this.state.mode === 'aiming') {
                    let diff = angleToPlayer - this.state.angle;
                    while (diff < -Math.PI) diff += Math.PI * 2;
                    while (diff > Math.PI) diff -= Math.PI * 2;
                    this.state.angle += Math.sign(diff) * Math.min(Math.abs(diff), 0.05);

                    this.state.timer--;
                    if (this.state.timer <= 0) {
                        this.state.mode = 'dashing';
                        this.state.timer = 90;
                        dashenemy.currentTime = 0;
                        dashenemy.play();
                    }
                } else if (this.state.mode === 'dashing') {
                    this.x += Math.cos(this.state.angle) * this.state.dashSpeed * 0.4;
                    this.y += Math.sin(this.state.angle) * this.state.dashSpeed * 0.4;
                    this.state.timer--;
                    if (this.state.timer <= 0) {
                        this.state.mode = 'resting';
                        this.state.timer = 75;
                    }
                } else if (this.state.mode === 'resting') {
                    this.state.timer--;
                    if (this.state.timer <= 0) {
                        this.state.mode = 'aiming';
                        this.state.timer = 100;
                    }
                }
                break;

            case 4:
                if (distToPlayer > this.state.distance + 100) {
                    this.state.mode = 'chase';
                } else if (distToPlayer < this.state.distance - 100) {
                    this.state.mode = 'flee';
                } else {
                    this.state.mode = 'shoot';
                }

                if (this.state.mode === 'chase') {
                    axialMove(this, angleToPlayer, this.speed / 1.35);
                } else if (this.state.mode === 'flee') {
                    // ปรับให้เดินหนี (ความเร็วติดลบ)
                    axialMove(this, angleToPlayer, -this.speed / 1.35);
                }

                if (this.state.cooldown > 0) {
                    this.state.cooldown--;
                } else if (this.state.mode === 'shoot') {
                    if (!this.state.aiming) {
                        this.state.aiming = true;
                        this.state.aimTimer = 18;
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
                        arrowSound.currentTime = 0;
                        arrowSound.play();
                        this.state.cooldown = 200;
                    }
                }
                break;

            case 5:
                // ปรับให้เดินเข้าหาถ้ายังไม่อยู่ในระยะโจมตี
                if (distToPlayer > 450) {
                    axialMove(this, angleToPlayer, this.speed);
                } else if (distToPlayer < 200) {
                    // เดินหนีถ้าผู้เล่นเข้าใกล้เกินไป
                    axialMove(this, angleToPlayer, -this.speed);
                }

                if (this.state.cooldown > 0) {
                    this.state.cooldown--;
                } else if (distToPlayer < 450) { // ระยะกลาง: ยิงเมื่ออยู่ในระยะ 450
                    aoeMarkers.push({
                        x: player.x,
                        y: player.y,
                        radius: 80,
                        timer: 0,
                        maxTimer: 180 // ระเบิดช้าลงเป็น 3 วินาที
                    });
                    this.state.cooldown = 180;
                }
                break;

            case 6:
                if (this.state.mode === 'chase') {
                    axialMove(this, angleToPlayer, this.speed);
                    this.state.timer--;
                    if (this.state.timer <= 0) {
                        this.state.mode = 'aiming';
                        this.state.timer = 120;
                        this.state.angle = angleToPlayer;
                        chargeSound.currentTime = 0;
                        chargeSound.play();
                    }
                } else if (this.state.mode === 'aiming') {
                    let diff = angleToPlayer - this.state.angle;
                    while (diff < -Math.PI) diff += Math.PI * 2;
                    while (diff > Math.PI) diff -= Math.PI * 2;
                    this.state.angle += Math.sign(diff) * Math.min(Math.abs(diff), 0.015);

                    this.state.timer--;
                    if (this.state.timer <= 0) {
                        this.state.mode = 'firing';
                        this.state.timer = 180;
                        laserSound.currentTime = 0;
                        laserSound.play();
                    }
                } else if (this.state.mode === 'firing') {
                    this.state.timer--;
                    const progress = (180 - this.state.timer) / 180;
                    const eased = progress * progress;
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
                break;

            case 7:
                if (this.state.mode === 'chase') {
                    axialMove(this, angleToPlayer, this.speed);
                    this.state.timer--;
                    if (this.state.timer <= 0 && distToPlayer < 350) {
                        this.state.mode = 'prepare';
                        this.state.timer = 40;
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
                    this.state.vz -= 0.5;

                    if (this.state.z <= 0) {
                        this.state.z = 0;
                        this.state.mode = 'landed';
                        this.state.timer = 30;

                        const blastRadius = 90;
                        if (getDist(this.x, this.y, target.x, target.y) < blastRadius + target.radius) {
                            dealDamageToTarget(target, 1);
                        }
                        aoeBlastEffects.push({ x: this.x, y: this.y, radius: blastRadius, life: 1.0 });
                        // screenShake = 10;
                        bombSound.currentTime = 0;
                        bombSound.volume = 0.4;
                        bombSound.play();
                    }
                } else if (this.state.mode === 'landed') {
                    this.state.timer--;
                    if (this.state.timer <= 0) {
                        this.state.mode = 'chase';
                        this.state.timer = 120;
                    }
                }
                break;

            case 8:
                // Keeps distance from player defensively
                if (distToPlayer < 200) {
                    // เดินหนี (ความเร็วติดลบ)
                    axialMove(this, angleToPlayer, -this.speed);
                } else if (distToPlayer > 300) {
                    // เดินเข้าหา
                    axialMove(this, angleToPlayer, this.speed);
                }
                break;

            case 9:
                if (this.state.cooldown > 0) this.state.cooldown--;

                if (this.state.mode === 'chase') {
                    axialMove(this, angleToPlayer, this.speed);

                    if (distToPlayer < 80 && this.state.cooldown <= 0) {
                        this.state.mode = 'prepare_swing';
                        this.state.timer = 20;
                        this.state.baseAngle = angleToPlayer;
                        let isFacingLeft = Math.abs(this.state.baseAngle) > Math.PI / 2;
                        this.state.swingSign = isFacingLeft ? -1 : 1;
                        this.state.currentAngle = this.state.baseAngle - (this.state.swingSign * Math.PI / 2);
                    }
                } else if (this.state.mode === 'prepare_swing') {
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
                        this.state.timer = 12;
                    }
                } else if (this.state.mode === 'swinging') {
                    const progress = 1 - (this.state.timer / 12);
                    this.state.currentAngle = this.state.baseAngle - (this.state.swingSign * Math.PI / 1.5) + (this.state.swingSign * Math.PI * 1.33 * progress);

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
                break;
        }

        if (!this.dead && getDist(this.x, this.y, target.x, target.y) < this.radius + target.radius) {
            if (this.type === 1 || this.type === 3) {
                dealDamageToTarget(target, 1);
            } else if (this.type === 2 && this.state.mode === 'chase') {
                this.explode();
            } else if (this.type === 7) {
                if (this.state.mode !== 'jump' && this.state.mode !== 'landed') dealDamageToTarget(target, 1);
            }
        }
    }

    explode() {
        if (this.dead) return;

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

        aoeBlastEffects.push({ x: this.x, y: this.y, radius: blastRadius, life: 1.0 });
        this.dead = true;
        bombSound.currentTime = 0;
        bombSound.volume = 0.5;
        bombSound.play();
    }

    draw(ctx) {
        if (this.dead) return;

        if (this.spawnTimer > 0) {
            const ratio = 1 - (this.spawnTimer / 30);
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(frameCount * 0.1);
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
            const drawAngle7 = getAngle(this.x, this.y, player.x, player.y);
            ctx.save();
            ctx.translate(this.x, drawY);

            if (Math.abs(drawAngle7) > Math.PI / 2) {
                ctx.rotate(drawAngle7 - Math.PI);
            } else {
                ctx.rotate(drawAngle7);
                ctx.scale(-1, 1);
            }

            if (enemyImages[7] && enemyImages[7].complete) {
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

        if (this.type === 6) {
            const staffAngle = (this.state.mode === 'chase')
                ? getAngle(this.x, this.y, player.x, player.y)
                : this.state.angle;

            const staffTipX = this.x + Math.cos(staffAngle) * 45;
            const staffTipY = this.y + Math.sin(staffAngle) * 45;

            if (this.state.mode === 'aiming') {
                ctx.beginPath();
                ctx.moveTo(staffTipX, staffTipY);
                const lx = staffTipX + Math.cos(this.state.angle) * 1200;
                const ly = staffTipY + Math.sin(this.state.angle) * 1200;
                ctx.lineCap = "round";
                ctx.lineTo(lx, ly);
                ctx.strokeStyle = `rgba(255, 0, 255, 0.4)`;
                ctx.lineWidth = 2;
                ctx.stroke();

                const maxTimer = 120;
                const chargeRatio = 1 - (this.state.timer / maxTimer);

                ctx.beginPath();
                ctx.arc(staffTipX, staffTipY, 15 * chargeRatio + Math.random() * 4, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + chargeRatio * 0.5})`;
                ctx.shadowColor = '#FF00FF';
                ctx.shadowBlur = 15;
                ctx.fill();
                ctx.shadowBlur = 0;

                const ringPhase = (this.state.timer % 30) / 30;
                ctx.beginPath();
                ctx.arc(staffTipX, staffTipY, 40 * ringPhase, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 0, 255, ${ringPhase})`;
                ctx.lineWidth = 2;
                ctx.stroke();

            } else if (this.state.mode === 'firing') {
                const currentLaserLength = Math.min(1200, (180 - this.state.timer) * 40);
                if (frameCount % 6 < 3) {
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

            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(staffAngle);
            ctx.drawImage(staffImg, -10, -5, 85, 55);
            ctx.restore();
        }

        if (this.type === 3 && this.state.mode === 'aiming') {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            const lx = this.x + Math.cos(this.state.angle) * 1000;
            const ly = this.y + Math.sin(this.state.angle) * 1000;
            ctx.lineTo(lx, ly);
            ctx.strokeStyle = `rgba(136, 85, 255, 0.4)`;
            ctx.lineWidth = 1 + (this.state.timer % 10 > 5 ? 2 : 0);
            ctx.stroke();
        }

        if (this.type === 2 && this.state.mode === 'exploding') {
            const pulsate = Math.sin(this.state.explodeTimer) * 2;
            const imgSize = (this.radius + pulsate) * 3.75;

            const drawAngle2 = getAngle(this.x, this.y, player.x, player.y);
            ctx.save();
            ctx.translate(this.x, this.y);

            if (Math.abs(drawAngle2) > Math.PI / 2) {
                ctx.rotate(drawAngle2 - Math.PI);
            } else {
                ctx.rotate(drawAngle2);
                ctx.scale(-1, 1);
            }

            if (enemyImages[2] && enemyImages[2].complete) {
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
            const progress = 1 - (this.state.explodeTimer / maxTimer);

            ctx.beginPath();
            ctx.arc(this.x, this.y, blastRadius, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(255, 170, 0, 0.5)";
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + (blastRadius - this.radius) * progress, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 170, 0, 0.3)";
            ctx.fill();
        } else {
            let imgSize = this.radius * 3.75;
            if (this.type === 4) {
                imgSize *= 1.5;
            }
            ctx.save();
            ctx.translate(this.x, this.y);

            const angleToPlayer = getAngle(this.x, this.y, player.x, player.y);
            let drawAngle = angleToPlayer;
            if (this.type === 3 || (this.type === 6 && this.state.mode !== 'chase')) {
                drawAngle = this.state.angle;
            } else if (this.type === 1) {
                drawAngle = player.x < this.x ? Math.PI : 0;
            }

            if (Math.abs(drawAngle) > Math.PI / 2) {
                ctx.rotate(drawAngle - Math.PI);
            } else {
                ctx.rotate(drawAngle);
                ctx.scale(-1, 1);
            }

            if (enemyImages[this.type] && enemyImages[this.type].complete) {
                ctx.drawImage(enemyImages[this.type], -imgSize / 2, -imgSize / 2, imgSize, imgSize);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
            ctx.restore();

            if (this.type === 5 && this.state.cooldown <= 45) {
                const ratio = this.state.cooldown / 45;

                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius + ratio * 20, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 255, 0, ${1 - ratio})`;
                ctx.lineWidth = 3;
                ctx.stroke();

                if (frameCount % 6 < 3) {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.radius * 0.7, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(255, 255, 0, 0.9)";
                    ctx.fill();
                }
            }

            if (this.type === 5 && aoeMarkers.length > 0) {
                ctx.save();
                ctx.setLineDash([8, 6]);
                ctx.lineWidth = 1.8;
                aoeMarkers.forEach(aoe => {
                    const alpha = 0.3 + (aoe.timer / aoe.maxTimer) * 0.6;
                    ctx.strokeStyle = `rgba(255, 50, 50, ${alpha})`;

                    const dx = aoe.x - this.x;
                    const dy = aoe.y - this.y;
                    const dist = Math.hypot(dx, dy);
                    const nx = dx / dist;
                    const ny = dy / dist;

                    const startX = this.x - ny * this.radius;
                    const startY = this.y + nx * this.radius;

                    const edgeX = aoe.x - nx * aoe.radius;
                    const edgeY = aoe.y - ny * aoe.radius;

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

        if (this.type === 4) {
            const bowAngle = getAngle(this.x, this.y, player.x, player.y);
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(bowAngle + Math.PI / -4);
            ctx.drawImage(bowImg, 4, 3, 40, 50);
            ctx.restore();

            if (this.state.aiming) {
                const bowX = this.x + Math.cos(bowAngle) * 20;
                const bowY = this.y + Math.sin(bowAngle) * 20;
                ctx.save();
                ctx.translate(bowX, bowY);
                ctx.rotate(bowAngle - Math.PI / 70);
                ctx.drawImage(arrowImg, 10, -100, 50, 200);
                ctx.restore();
                arrowSound.play();
                arrowSound.currentTime = 0;
            }
        }

        if (this.type === 9) {
            let drawAngle = 0;
            if (this.state.mode === 'prepare_swing' || this.state.mode === 'swinging') {
                drawAngle = this.state.currentAngle;
            } else {
                drawAngle = getAngle(this.x, this.y, player.x, player.y) + Math.PI / 6;
            }

            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(drawAngle);

            if (Math.abs(drawAngle) > Math.PI / 2) {
                ctx.scale(1, -1);
            }

            ctx.rotate(Math.PI / 4);
            ctx.drawImage(swordImg, 0, -60, 60, 60);
            ctx.restore();

            if (this.state.mode === 'prepare_swing') {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius + 4, 0, Math.PI * 2);
                ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
                ctx.lineWidth = 2;
                ctx.stroke();
            } else if (this.state.mode === 'swinging') {
                ctx.beginPath();
                let startArc = this.state.baseAngle - (this.state.swingSign * Math.PI / 1.5);
                ctx.arc(this.x, this.y, 75, startArc, this.state.currentAngle, this.state.swingSign === -1);
                ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
                ctx.lineWidth = 12;
                ctx.stroke();
                swingsword.play();
                swingsword.currentTime = 0;
            }
        }

        if (this.isBuffed) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 6 + Math.sin(frameCount * 0.1) * 3, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 0, 0, 0.8)`;
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        if (this.type === 8 && this.state.targets) {
            ctx.strokeStyle = `rgba(255, 0, 0, 0.5)`;
            ctx.lineWidth = 2;
            this.state.targets.forEach(t => {
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(t.x, t.y);
                ctx.stroke();

                const phase = (frameCount % 30) / 30;
                const px = this.x + (t.x - this.x) * phase;
                const py = this.y + (t.y - this.y) * phase;
                ctx.beginPath();
                ctx.arc(px, py, 4, 0, Math.PI * 2);
                ctx.fillStyle = "#FF0000";
                ctx.fill();
            });
        }
    }
}

class Boss extends Enemy {
    constructor(x, y, type) {
        super(x, y, type);
    }

    init(type) {
        if (type === 10) {
            this.hp = 250; this.maxHp = 250;
            this.speed = 0.25;
            this.radius = 30;
            this.state = { mode: 'chase', spawnCooldown: 120, attackCooldown: 60 };
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
        } else if (type === 14) {
            this.hp = 600; this.maxHp = 600;
            this.speed = 0.25; this.radius = 50;
            this.state = { mode: 'chase', timer: 60, targetAngle: 0, swingProgress: 0 };
        } else if (type === 131) {
            this.hp = 80; this.maxHp = 80; this.speed = 0.65; this.radius = 16;
            this.color = "#FF3333";
            this.state = { mode: 'chase', chargeCooldown: 60 };
        } else if (type === 132) {
            this.hp = 80; this.maxHp = 80; this.speed = 0.5; this.radius = 16;
            this.color = "#33AAFF";
            this.state = { mode: 'shoot', distance: 200, cooldown: 60, burstCount: 0, burstTimer: 0 };
        } else if (type === 133) {
            this.hp = 80; this.maxHp = 80; this.speed = 0.4; this.radius = 18;
            this.color = "#FF00FF";
            this.state = { mode: 'prepare', timer: 60, angle: 0 };
        } else if (type === 134) {
            this.hp = 80; this.maxHp = 80; this.speed = 0.3; this.radius = 16;
            this.color = "#33FF33";
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
            } catch(e) { 
                isHostOrOffline = true; 
            }
            if (isHostOrOffline) {
                const reward = enemyRewards[this.type] || { xp: 10, coin: 10 };
                if (typeof gameLogic !== 'undefined' && gameLogic.levelManager) {
                    if (reward.xp > 0) gameLogic.levelManager.spawnXP(this.x, this.y, reward.xp);
                    if (reward.coin > 0) gameLogic.levelManager.spawnCoin(this.x, this.y, reward.coin);
                }
            }
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
            if (distToPlayer > 350) {
                axialMove(this, angleToPlayer, this.speed);
            } else if (distToPlayer < 250) {
                axialMove(this, angleToPlayer, -this.speed);
            }

            if (this.state.spawnCooldown > 0) this.state.spawnCooldown--;
            else {
                const e1 = new Enemy(this.x - 40, this.y + 40, 1);
                const e2 = new Enemy(this.x + 40, this.y + 40, 1);
                enemies.push(e1, e2);
                this.state.spawnCooldown = 300;
            }

            if (this.state.attackCooldown > 0) this.state.attackCooldown--;
            else {
                const activeBullets = bullets.filter(b => b.owner === 10 && b.active).length;
                if (activeBullets < 4) {
                    const lifetime = 180;
                    bullets.push(new Bullet(this.x, this.y, angleToPlayer + Math.PI / 4, 4, 8, this.color, -0.02, 10, null, lifetime));
                    bullets.push(new Bullet(this.x, this.y, angleToPlayer - Math.PI / 4, 4, 8, this.color, 0.02, 10, null, lifetime));
                }
                this.state.attackCooldown = 120;
            }

        } else if (this.type === 11) {
            if (distToPlayer > 400) {
                axialMove(this, angleToPlayer, this.speed);
            } else if (distToPlayer < 300) {
                axialMove(this, angleToPlayer, -this.speed);
            }

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

                    bullets.push(new Bullet(leftX, leftY, angL, 3.5, 4, "#FFFFFF", 0.005, 11));
                    bullets.push(new Bullet(rightX, rightY, angR, 3.5, 4, "#FFFFFF", -0.005, 11));
                }

                if (this.state.timer <= 0) {
                    this.state.mode = 'cast_prepare';
                    this.state.timer = 180;
                    chargeSound.currentTime = 0;
                    chargeSound.volume = 0.5;
                    chargeSound.play();
                    this.state.targetAngles = [angleToPlayer];
                }
            } else if (this.state.mode === 'cast_prepare') {
                this.state.timer--;

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

                if (this.state.timer > 15) {
                    this.state.targetAngles = [this.state.angle];
                }

                if (this.state.timer <= 0) {
                    this.state.mode = 'firing';
                    this.state.timer = 60;
                    laserSound.currentTime = 0;
                    laserSound.volume = 0.6;
                    laserSound.play();
                }
            } else if (this.state.mode === 'firing') {
                this.state.timer--;

                const laserLength = 1500;
                if (this.state.timer > 15) {
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
                    this.state.timer = 150;
                }
            }

            if (distToPlayer < this.radius + target.radius) {
                dealDamageToTarget(target, 1);
            }
        } else if (this.type === 12) {
            if (this.state.trail) {
                this.state.trail.push({ x: this.x, y: this.y, opacity: 0.6 });
                if (this.state.trail.length > 15) this.state.trail.shift();
            }

            if (this.hp < this.maxHp * 0.5 && !this.state.isEnraged) {
                this.state.isEnraged = true;
                this.color = "#FF3366";
                screenShake = 15;
            }

            if (this.state.mode === 'chase') {
                const moveSpeed = this.state.isEnraged ? this.speed * 1.5 : this.speed;
                axialMove(this, angleToPlayer, moveSpeed);
                this.state.timer--;
                if (this.state.timer <= 0) {
                    this.state.mode = 'prepare';
                    this.state.timer = this.state.isEnraged ? 40 : 70;
                    chargeSound.currentTime = 0;
                    chargeSound.volume = 0.4;
                    chargeSound.play();
                }
            } else if (this.state.mode === 'prepare') {
                this.state.angle = angleToPlayer;
                this.state.timer--;
                if (this.state.timer <= 0) {
                    this.state.mode = 'dash';
                    this.state.timer = 20;
                    this.state.dashCount++;
                    if (dashenemy) { dashenemy.currentTime = 0; dashenemy.play(); }
                    screenShake = 5;

                    const skeletonCount = enemies.filter(e => e.type === 9 && !e.dead).length;
                    if (skeletonCount < 5) {
                        enemies.push(new Enemy(this.x, this.y, 9));
                    }
                }
            } else if (this.state.mode === 'dash') {
                const dashSpeed = this.state.isEnraged ? 24 : 18;
                axialMove(this, this.state.angle, dashSpeed);

                if (getDist(this.x, this.y, target.x, target.y) < this.radius + target.radius) {
                    dealDamageToTarget(target, 1);
                    screenShake = 10;
                }

                this.state.timer--;
                if (this.state.timer <= 0) {
                    const maxDashes = this.state.isEnraged ? 3 : 1;
                    if (this.state.dashCount < maxDashes) {
                        this.state.mode = 'prepare';
                        this.state.timer = 15;
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

            if (distToPlayer < this.radius + target.radius) {
                dealDamageToTarget(target, 1);
            }
        } else if (this.type === 13) {
            axialMove(this, angleToPlayer, this.speed);
            this.state.timer--;
            if (this.state.timer <= 0) {
                for (let i = 0; i < 8; i++) {
                    bullets.push(new Bullet(this.x, this.y, (Math.PI * 2 / 8) * i, 3, 6, this.color, 0, 13));
                }
                this.state.timer = 120;
                bombSound.currentTime = 0;
                bombSound.play();
            }
            if (distToPlayer < this.radius + target.radius) dealDamageToTarget(target, 1);
        } else if (this.type === 14) {
            if (this.state.mode === 'chase') {
                axialMove(this, angleToPlayer, this.speed);
                this.state.timer--;

                if (this.state.timer <= 0) {
                    this.state.mode = 'prepare_swing';
                    this.state.timer = 60;
                    this.state.targetAngle = angleToPlayer;
                    chargeSound.currentTime = 0;
                    chargeSound.volume = 0.5;
                    chargeSound.play();
                }
            } else if (this.state.mode === 'prepare_swing') {
                let diff = angleToPlayer - this.state.targetAngle;
                while (diff < -Math.PI) diff += Math.PI * 2;
                while (diff > Math.PI) diff -= Math.PI * 2;
                this.state.targetAngle += Math.sign(diff) * Math.min(Math.abs(diff), 0.05);

                this.state.timer--;
                if (this.state.timer <= 0) {
                    this.state.mode = 'swinging';
                    this.state.timer = 15;
                    this.state.swingProgress = 0;
                    if (swingsword) { swingsword.currentTime = 0; swingsword.play(); }
                }
            } else if (this.state.mode === 'swinging') {
                this.state.timer--;

                if (this.state.timer <= 0) {
                    this.state.mode = 'landed';
                    this.state.timer = 75;

                    const smashDist = this.radius + 130;
                    const smashX = this.x + Math.cos(this.state.targetAngle) * smashDist;
                    const smashY = this.y + Math.sin(this.state.targetAngle) * smashDist;

                    const blastRadius = 100;
                    const distToSmash = getDist(smashX, smashY, target.x, target.y);
                    if (distToSmash < blastRadius + target.radius) {
                        dealDamageToTarget(target, 1);
                    }
                    screenShake = 25;
                    bombSound.currentTime = 0;
                    bombSound.volume = 0.8;
                    bombSound.play();
                }
            } else if (this.state.mode === 'landed') {
                this.state.timer--;
                if (this.state.timer <= 0) {
                    this.state.mode = 'chase';
                    this.state.timer = 240;
                }
            }
        } else if (this.type === 131) {
            if (this.state.mode === 'chase') {
                axialMove(this, angleToPlayer, this.speed);
                this.state.chargeCooldown--;
                if (this.state.chargeCooldown <= 0) {
                    this.state.mode = 'lunge';
                    this.state.lungeTimer = 15;
                    this.state.angle = angleToPlayer;
                }
            } else if (this.state.mode === 'lunge') {
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
        } else if (this.type === 132) {
            if (distToPlayer > this.state.distance + 50) {
                axialMove(this, angleToPlayer, this.speed);
            } else if (distToPlayer < this.state.distance - 50) {
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
        } else if (this.type === 133) {
            if (this.state.mode === 'prepare') {
                this.state.angle = angleToPlayer;
                this.state.timer--;
                if (this.state.timer <= 0) {
                    this.state.mode = 'dash';
                    this.state.timer = 18;
                    if (dashenemy) { dashenemy.currentTime = 0; dashenemy.play(); }
                }
            } else if (this.state.mode === 'dash') {
                axialMove(this, this.state.angle, 12);
                this.state.timer--;
                if (getDist(this.x, this.y, target.x, target.y) < this.radius + target.radius) dealDamageToTarget(target, 1);
                if (this.state.timer <= 0) {
                    this.state.mode = 'prepare';
                    this.state.timer = 120;
                }
            }
        } else if (this.type === 134) {
            axialMove(this, angleToPlayer, this.speed * 0.6);

            if (this.state.cooldown > 0) this.state.cooldown--;
            else {
                aoeMarkers.push({ x: target.x, y: target.y, radius: 80, timer: 0, maxTimer: 120 });
                this.state.cooldown = 200;
            }
            if (distToPlayer < this.radius + target.radius) dealDamageToTarget(target, 1);
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
            const walkImg = getBossWalkImage(this);
            const drawImg = walkImg || bossImages[10];

            ctx.save();
            ctx.translate(this.x, this.y);
            if (Math.abs(angleToPlayer) > Math.PI / 2) {
                ctx.scale(-1, 1);
            }
            if (drawImg && drawImg.complete) {
                ctx.drawImage(drawImg, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
            ctx.restore();

        } else if (this.type === 11) {
            const aimAngle11 = getAngle(this.x, this.y, player.x, player.y);
            const imgSize11 = this.radius * 4;
            const isFacingLeft11 = Math.abs(aimAngle11) > Math.PI / 2;
            const walkImg11 = getBossWalkImage(this);
            const drawImg11 = walkImg11 || bossImages[11];

            ctx.save();
            ctx.translate(this.x, this.y);
            if (isFacingLeft11) {
                ctx.scale(-1, 1);
            }
            if (drawImg11 && drawImg11.complete) {
                ctx.drawImage(drawImg11, -imgSize11 / 2, -imgSize11 / 2, imgSize11, imgSize11);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
            ctx.restore();

            const leftOrbX = this.x + Math.cos(this.state.angle + Math.PI * 0.75) * 70;
            const leftOrbY = this.y + Math.sin(this.state.angle + Math.PI * 0.75) * 70;
            const rightOrbX = this.x + Math.cos(this.state.angle - Math.PI * 0.75) * 70;
            const rightOrbY = this.y + Math.sin(this.state.angle - Math.PI * 0.75) * 70;

            ctx.save();
            ctx.translate(leftOrbX, leftOrbY);
            ctx.drawImage(magicCircleImg, -20, -20, 40, 40);
            ctx.restore();

            ctx.save();
            ctx.translate(rightOrbX, rightOrbY);
            ctx.drawImage(magicCircleImg, -20, -20, 40, 40);
            ctx.restore();

            const staffAngle = this.state.angle;
            const staffTipX = this.x + Math.cos(staffAngle) * 45;
            const staffTipY = this.y + Math.sin(staffAngle) * 45;

            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(staffAngle);
            if (Math.abs(staffAngle) > Math.PI / 2) {
                ctx.scale(1, -1);
            }
            ctx.drawImage(staffImg, -10, -5, 85, 55);
            ctx.restore();

            if (this.state.mode === 'rapid_firing' || (this.state.mode === 'cast_prepare' && this.state.timer > 30)) {
                ctx.save();
                ctx.setLineDash([8, 8]);
                const phase = (frameCount * 2) % 16;
                ctx.lineDashOffset = -phase;
                ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
                ctx.lineWidth = 1.5;

                ctx.beginPath();
                ctx.moveTo(leftOrbX, leftOrbY);
                ctx.lineTo(player.x, player.y);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(rightOrbX, rightOrbY);
                ctx.lineTo(player.x, player.y);
                ctx.stroke();

                ctx.restore();
            }

            if (this.state.mode === 'cast_prepare') {
                const maxTimer = 180;
                const chargeRatio = 1 - (this.state.timer / maxTimer);

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
                const fadeRatio = this.state.timer / 35;
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

                ctx.beginPath();
                ctx.arc(staffTipX, staffTipY, 25 * fadeRatio, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${fadeRatio})`;
                ctx.fill();
            }

        } else if (this.type === 12) {
            const aimAngle12 = getAngle(this.x, this.y, player.x, player.y);
            let drawAngle12 = aimAngle12;
            if (this.state.mode === 'prepare' || this.state.mode === 'dash') {
                drawAngle12 = this.state.angle;
            }

            const imgSize12 = this.radius * 3.75;
            const isFacingLeft12 = Math.abs(drawAngle12) > Math.PI / 2;
            const walkImg12 = getBossWalkImage(this);
            const drawImg12 = walkImg12 || bossImages[12];

            ctx.save();
            ctx.translate(this.x, this.y);
            if (isFacingLeft12) {
                ctx.scale(-1, 1);
            }
            if (drawImg12 && drawImg12.complete) {
                ctx.drawImage(drawImg12, -imgSize12 / 2, -imgSize12 / 2, imgSize12, imgSize12);
            } else {
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

            if (this.state.mode === 'prepare') {
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                const lx = this.x + Math.cos(this.state.angle) * 1500;
                const ly = this.y + Math.sin(this.state.angle) * 1500;
                ctx.lineTo(lx, ly);

                const alpha = 0.2 + (Math.sin(frameCount * 0.3) * 0.1);
                ctx.strokeStyle = `rgba(0, 255, 204, ${alpha})`;
                ctx.lineWidth = 2;
                ctx.setLineDash([10, 10]);
                ctx.stroke();

                const beamWidth = (this.state.timer / 80) * 40;
                ctx.strokeStyle = `rgba(0, 255, 204, 0.1)`;
                ctx.lineWidth = beamWidth;
                ctx.setLineDash([]);
                ctx.stroke();
                ctx.restore();

                for (let i = 0; i < 4; i++) {
                    const pAngle = frameCount * 0.1 + (i * Math.PI / 2);
                    const pDist = (this.state.timer / 80) * 100;
                    ctx.beginPath();
                    ctx.arc(this.x + Math.cos(pAngle) * pDist, this.y + Math.sin(pAngle) * pDist, 4, 0, Math.PI * 2);
                    ctx.fillStyle = this.color;
                    ctx.fill();
                }
            } else if (this.state.mode === 'dash') {
                ctx.beginPath();
                const bx = this.x - Math.cos(this.state.angle) * 40;
                const by = this.y - Math.sin(this.state.angle) * 40;
                ctx.moveTo(bx, by);
                ctx.lineTo(this.x + Math.cos(this.state.angle + Math.PI / 2) * this.radius, this.y + Math.sin(this.state.angle + Math.PI / 2) * this.radius);
                ctx.lineTo(this.x + Math.cos(this.state.angle - Math.PI / 2) * this.radius, this.y + Math.sin(this.state.angle - Math.PI / 2) * this.radius);
                ctx.closePath();
                ctx.fillStyle = `rgba(0, 255, 204, 0.4)`;
                ctx.fill();
            }

        } else if (this.type === 14) {
            let drawY = this.y;
            let drawRadius = this.radius;

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

                if (frameCount % 6 < 3) {
                    ctx.beginPath();
                    ctx.arc(this.x, drawY, drawRadius + 6, 0, Math.PI * 2);
                    ctx.strokeStyle = "rgba(255, 100, 100, 0.8)";
                    ctx.lineWidth = 3;
                    ctx.stroke();
                }
            } else if (this.state.mode === 'chase' && this.state.timer % 60 < 10) {
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
            }

            // เลือก sprite ตามสถานะ — chase ใช้ walk frame ถ้ามี
            let giantImg;
            if (this.state.mode === 'swinging' || this.state.mode === 'landed') {
                giantImg = bossImages['14_down'];
            } else if (this.state.mode === 'prepare_swing') {
                giantImg = bossImages['14_up'];
            } else {
                // chase — ใช้ walk animation
                giantImg = getBossWalkImage(this) || bossImages[14];
            }

            if (giantImg && giantImg.complete) {
                const sizeScale = (this.state.mode === 'chase') ? 0.75 : 1.0;
                const imgSize = this.radius * 3.75 * sizeScale;
                ctx.drawImage(giantImg, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, drawRadius, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(0, 0, 10, 0, Math.PI * 2);
                ctx.fillStyle = "#FF3300";
                ctx.shadowColor = "#FF0000";
                ctx.shadowBlur = 10;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
            ctx.restore();

            ctx.save();
            ctx.translate(this.x, this.y);

            let weaponAngle = isFacingLeft ? Math.PI : 0;;

            if (this.state.mode === 'prepare_swing') {
                weaponAngle -= flipSign * Math.PI / 2;
            } else if (this.state.mode === 'swinging') {
                let windup = -flipSign * Math.PI / 2;
                let swingTotal = flipSign * (Math.PI);
                weaponAngle += windup + (swingTotal * this.state.swingProgress);
            } else if (this.state.mode === 'landed') {
                weaponAngle += flipSign * (Math.PI / 2);
            } else {
                weaponAngle -= flipSign * Math.PI / 6;
            }

            ctx.rotate(weaponAngle);
            if (isFacingLeft) {
                ctx.scale(1, -1);
            }

            if (typeof weaponGiantImg !== 'undefined' && weaponGiantImg.complete) {
                ctx.rotate(540);
                ctx.drawImage(weaponGiantImg, 30, -75, 100, 100);
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
                ctx.strokeStyle = `rgba(255, 0, 255, ${alpha})`;
                ctx.lineWidth = 3;
                ctx.setLineDash([15, 10]);
                ctx.stroke();
                ctx.restore();
            }

            if (this.type === 13) {
                const aimAngle = getAngle(this.x, this.y, player.x, player.y);
                const imgSize = this.radius * 3.75;
                const isFacingLeft = Math.abs(aimAngle) > Math.PI / 2;
                // บอส 13 เดินตลอด ใช้ walk frame ได้เลย
                const walkImg13 = getBossWalkImage(this);
                const drawImg13 = walkImg13 || bossImages[13];

                ctx.save();
                ctx.translate(this.x, this.y);
                if (isFacingLeft) {
                    ctx.scale(-1, 1);
                }
                if (drawImg13 && drawImg13.complete) {
                    ctx.drawImage(drawImg13, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
                } else {
                    ctx.beginPath();
                    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
                    ctx.fillStyle = this.color;
                    ctx.fill();
                }
                ctx.restore();
            } else {
                // mini-boss 131-134
                const aimAngle = getAngle(this.x, this.y, player.x, player.y);
                const imgSize = this.radius * 3.75;
                const isFacingLeft = Math.abs(aimAngle) > Math.PI / 2;
                const walkImgMini = getBossWalkImage(this);
                const drawImgMini = walkImgMini || bossImages[this.type];

                ctx.save();
                ctx.translate(this.x, this.y);
                if (isFacingLeft) {
                    ctx.scale(-1, 1);
                }
                if (drawImgMini && drawImgMini.complete) {
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
    }
}
