class Level {
    constructor(x, y, type, id = null, initialValue = null) {
        this.id = id || (Date.now() + Math.random().toString(36).substr(2, 9));
        this.x = x;
        this.y = y;
        this.type = type; // 'small' (1 XP), 'medium' (2 XP), 'large' (3 XP)
        this.collected = false;
        this.floatTimer = 0; // สำหรับเอฟเฟกต์ลอยตัว
        this.rotation = Math.random() * Math.PI * 2;
        this.darkColor = '#444444'; // สีเข้มสำหรับ gradient

        // กำหนดค่า XP และสีตามประเภท
        switch (type) {
            case 'small':
                this.xpValue = 1;
                this.color = '#00FF88'; // สีเขียว
                this.darkColor = '#006633';
                this.radius = 6;
                break;
            case 'medium':
                this.xpValue = 2;
                this.color = '#FFD700'; // สีทอง
                this.radius = 8;
                this.darkColor = '#996600';
                break;
            case 'large':
                this.xpValue = 3;
                this.color = '#FF6BCD'; // สีแดง
                this.radius = 10;
                this.darkColor = '#99004C';
                break;
            case 'coin':
                this.coinValue = initialValue || 1; // ใช้ค่าที่ส่งมาโดยตรง
                this.xpValue = 0;
                this.color = '#FFFF00'; // สีเหลืองเหรียญ
                this.darkColor = '#B8860B';
                this.radius = 7;
                break;
            default:
                this.xpValue = 1;
                this.color = '#FFFFFF';
                this.radius = 6;
        }
        this.isAttracted = false; // สำหรับระบบ Magnet
    }

    update(player) {
        if (this.collected) return;

        this.floatTimer += 0.05;
        this.rotation += 0.05;

        // ระบบ Magnet (ดูดเข้าหาตัว)
        if (player && !player.isDead) {
            const dist = Math.hypot(this.x - player.x, this.y - player.y);
            const magnetRange = player.magnetRange || 150;

            if (dist < magnetRange) {
                this.isAttracted = true;
            }

            if (this.isAttracted) {
                const angle = Math.atan2(player.y - this.y, player.x - this.x);
                // ความเร็วเข้าหาตัว ค่อยๆ เร็วขึ้นตามระยะที่เข้าใกล้
                const speed = 7;
                this.x += Math.cos(angle) * speed;
                this.y += Math.sin(angle) * speed;
            }
        }
    }

    // ตรวจสอบการชนกับผู้เล่น
    checkCollisionWithPlayer(player) {
        if (this.collected) return false;

        const dist = Math.hypot(this.x - player.x, this.y - player.y);
        const result = dist < this.radius + player.radius;

        // Debug: เช็คระยะทาง
        if (result) {
            console.log('Collision detected!', { dist, playerX: player.x, playerY: player.y, levelX: this.x, levelY: this.y });
        }
        return result;
    }

    // วาดระบบแต่ง (Drawing function)
    draw(ctx, camera) {
        if (this.collected) return;

        // ไม่ต้องหัก camera เพราะ GameTest.html translate ให้แล้ว
        const screenX = this.x;
        const screenY = this.y;

        // เช็ค culling ปรับใหม่
        const drawX = this.x - camera.x;
        const drawY = this.y - camera.y;
        if (drawX < -50 || drawX > ctx.canvas.width + 50 ||
            drawY < -50 || drawY > ctx.canvas.height + 50) return;

        ctx.save();

        // เงาใต้ orb
        ctx.beginPath();
        ctx.ellipse(screenX, screenY + this.radius, this.radius * 0.9, this.radius * 0.3, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fill();

        // glow
        const glow = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, this.radius * 2.5);
        glow.addColorStop(0, this.color + '55');
        glow.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // orb หลัก
        const grad = ctx.createRadialGradient(
            screenX - this.radius * 0.3, screenY - this.radius * 0.3, this.radius * 0.1,
            screenX, screenY, this.radius
        );
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, this.color);
        grad.addColorStop(1, this.darkColor);
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // highlight
        ctx.beginPath();
        ctx.arc(screenX - this.radius * 0.25, screenY - this.radius * 0.25, this.radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.fill();

        // Text (XP หรือ Coin)
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${this.radius}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 3;
        const text = (this.type === 'coin') ? '฿' : this.xpValue;
        ctx.fillText(text, screenX, screenY);
        ctx.shadowBlur = 0;

        ctx.restore();
    }
}

// ============================================================
// LEVEL MANAGER - จัดการการสร้างและลบระดับ
// ============================================================
class LevelManager {
    constructor(gameLogic) {
        this.gameLogic = gameLogic;
        this.levels = [];
        this.spawnCooldown = 0;
        this.mapWidth = 1920;  // ความกว้างแผนที่เริ่มต้น (สามารถปรับได้)
        this.mapHeight = 1080; // ความสูงแผนที่เริ่มต้น (สามารถปรับได้)
    }

    setMapSize(width, height) {
        this.mapWidth = width;
        this.mapHeight = height;
    }

    update() {
        this.spawnCooldown--;
        const p1 = this.gameLogic.player;
        // รองรับระบบ Multiplayer: เช็คผู้เล่นคนที่ 2 (Remote Player)
        const p2 = (typeof window !== 'undefined' && window.player2 && window.player2.active) ? window.player2 : null;

        // อัปเดตระดับทั้งหมด
        for (let i = this.levels.length - 1; i >= 0; i--) {
            const level = this.levels[i];

            // หาผู้เล่นที่อยู่ใกล้ที่สุดเพื่อคำนวณ Magnet
            let closestPlayer = p1;
            if (p2 && !p2.isDead) {
                if (!p1 || p1.isDead) {
                    closestPlayer = p2;
                } else {
                    const d1 = Math.hypot(level.x - p1.x, level.y - p1.y);
                    const d2 = Math.hypot(level.x - p2.x, level.y - p2.y);
                    if (d2 < d1) closestPlayer = p2;
                }
            }

            level.update(closestPlayer); // ส่งตัวละครที่ใกล้ที่สุดเพื่อเช็ค Magnet

            if (level.collected) {
                this.levels.splice(i, 1);
            }
        }
    }

    // สร้างระดับแบบสุ่มที่ตำแหน่งสุ่มบนแผนที่
    spawnRandomLevel(x, y) {
        const types = ['small', 'medium', 'large'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        const level = new Level(x, y, randomType);
        this.levels.push(level);
        return level;
    }

    // ฟังก์ชันใหม่สำหรับสร้างเหรียญ
    spawnCoin(x, y, value = 1) {
        const level = new Level(x, y, 'coin', null, value);
        level.coinValue = value; // กำหนดค่าเหรียญ
        this.levels.push(level);
        return level;
    }

    // ฟังก์ชันใหม่สำหรับสร้างค่า XP โดยตรง
    spawnXP(x, y, value = 1) {
        let type = 'small';
        if (value >= 5) type = 'large';
        else if (value >= 3) type = 'medium';
        const level = new Level(x, y, type);
        level.xpValue = value;
        this.levels.push(level);
        return level;
    }

    // สร้างระดับแบบ "ฟาร์ม" - สร้างหลายตัวที่ตำแหน่งต่าง ๆ
    // แก้เป็น — spawn รอบผู้เล่นเสมอ ไม่ติดขอบแผนที่
    spawnLevelWave(count = 5) {
        const player = this.gameLogic.player; // ต้องส่ง player เข้ามาด้วย (ดูด้านล่าง)

        for (let i = 0; i < count; i++) {
            let x, y;

            if (player) {
                // spawn รอบผู้เล่นในระยะ 200-600px
                const angle = Math.random() * Math.PI * 2;
                const dist = 200 + Math.random() * 400;
                x = player.x + Math.cos(angle) * dist;
                y = player.y + Math.sin(angle) * dist;
            } else {
                x = Math.random() * this.mapWidth;
                y = Math.random() * this.mapHeight;
            }

            this.spawnRandomLevel(x, y);
        }
    }

    // สร้างระดับรอบ ๆ ผู้เล่น
    spawnLevelsAroundPlayer(player, count = 3, radius = 300) {
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const distance = radius * (0.5 + Math.random() * 0.5);
            const x = player.x + Math.cos(angle) * distance;
            const y = player.y + Math.sin(angle) * distance;

            // ตรวจสอบขอบเขตแผนที่
            const clampedX = Math.max(50, Math.min(this.mapWidth - 50, x));
            const clampedY = Math.max(50, Math.min(this.mapHeight - 50, y));

            this.spawnRandomLevel(clampedX, clampedY);
        }
    }

    // ตรวจสอบการเก็บของผู้เล่น
    checkPlayerCollection(player, isRemote = false) {
        for (let i = this.levels.length - 1; i >= 0; i--) {
            const level = this.levels[i];
            if (level.checkCollisionWithPlayer(player)) {
                level.collected = true;
                if (level.type === 'coin') {
                    if (!isRemote) {
                        console.log('Coin collected!', level.coinValue);
                        this.gameLogic.addcoin(level.coinValue);
                    }
                } else {
                    console.log('Level collected!', level.type, level.xpValue);
                    this.gameLogic.addXP(level.xpValue);
                }
            }
        }
    }

    // วาดระดับทั้งหมด
    drawAll(ctx, camera) {
        this.levels.forEach(level => level.draw(ctx, camera));
    }

    // ลบระดับทั้งหมด
    clear() {
        this.levels = [];
    }

    // ได้จำนวนระดับปัจจุบัน
    getCount() {
        return this.levels.length;
    }
}

// ===== WAVE SYSTEM =====
class WaveManager {
    constructor() {
        this.currentWave = 1;
        this.waveTimer = 45; // 45 วินาที ต่อเวฟ
        this.waveTimerMax = 45;
        this.countdownTimer = 3; // 3 วินาทีถอยหลังก่อน spawn มอน
        this.countdownMax = 3;
        this.enemiesInWave = 0;
        this.enemiesKilled = 0;
        this.isWaveActive = false;
        this.hasSpawned = false; // ตรวจสอบว่า spawn มอนแล้วหรือยัง
        this.isShopOpen = false;
        this.onWaveComplete = null;

        // Spawn control
        this.spawnTimer = 0; // นับเวลาในการ spawn มอนแต่ละตัว
        this.spawnInterval = 1.0; // spawn ทุกๆ 1 วินาที (ปรับจาก 3.0 เพื่อให้ทัน wave timer)
        this.spawnedCount = 0; // จำนวนมอนที่ spawn แล้ว
    }

    // คำนวณจำนวนมอนในเวฟนี้
    getEnemyCount(wave) {
        return 10 + (wave - 1) * 5; // wave 1: 10, wave 2: 15, wave 3: 20 ...
    }

    // ตรวจสอบว่าเวฟนี้มีบอสหรือไม่
    hasBoss(wave) {
        return wave % 1 === 0; // wave 10, 20, 30, 40, 50 ฯลฯ
    }

    // เริ่มเวฟใหม่ (ทำให้เรียกจาก GameTest.html)
    startWave(waveNumber = null) {
        if (waveNumber !== null) {
            this.currentWave = waveNumber;
        }
        this.waveTimer = this.waveTimerMax;
        this.countdownTimer = this.countdownMax; // รีเซต countdown
        this.enemiesInWave = this.getEnemyCount(this.currentWave);
        this.enemiesKilled = 0;
        this.isWaveActive = true;
        this.hasSpawned = false; // ตั้งค่าเป็น false เพื่อรอ countdown จบ
        this.isShopOpen = false;
        this.spawnTimer = 0; // รีเซต spawn timer
        this.spawnedCount = 0; // รีเซต spawn count
        console.log(`🌊 Wave ${this.currentWave} preparing... Countdown: ${Math.ceil(this.countdownTimer)}s`);
    }

    // อัพเดตเวฟ (เรียกจาก update loop)
    update(dt, activeEnemies, playerObj) {
        if (!this.isWaveActive) return;

        // === Phase 1: Countdown ===
        if (!this.hasSpawned) {
            this.countdownTimer -= dt;

            if (this.countdownTimer <= 0) {
                // Countdown จบแล้ว → เริ่มขั้นตอน spawn
                this.hasSpawned = true;
                this.spawnTimer = 0; // รีเซตสำหรับการ spawn ทีละตัว
                console.log(`🚀 Wave ${this.currentWave} spawn phase started!`);
            }
            return; // ยังอยู่ใน countdown
        }

        // === Phase 2: Spawn enemies one by one ===
        if (this.spawnedCount < this.enemiesInWave) {
            this.spawnTimer += dt;

            if (this.spawnTimer >= this.spawnInterval) {
                this.spawnSingleEnemy(playerObj);
                this.spawnedCount++;
                this.spawnTimer = 0; // รีเซต timer สำหรับตัวถัดไป
            }
            // ไม่ return แล้ว เพื่อให้โค้ดด้านล่าง (การลดเวลา) ทำงานด้วย
        }

        // === Phase 2.5: Spawn Boss (if applicable) ===
        if (this.spawnedCount === this.enemiesInWave && this.hasBoss(this.currentWave)) {
            this.spawnBoss(playerObj);
            this.spawnedCount++; // เพิ่ม count เพื่อไม่ให้ spawn บอสซ้ำ
        }

        // === Phase 3: Spawning complete, monitor wave ===

        // นับมอนที่เหลือ
        const activeEnemyCount = activeEnemies.length;

        // เช็คว่าทุกตัวตายแล้วหรือ
        if (this.spawnedCount >= this.enemiesInWave && activeEnemyCount === 0) {
            this.waveComplete();
            return;
        }

        // ลดเวลาเวฟ
        this.waveTimer -= dt;
        if (this.waveTimer <= 0) {
            this.waveComplete();
        }
    }

    // Spawn มอนตัวเดียว
    spawnSingleEnemy(playerObj) {
        if (!playerObj) return;

        const angle = Math.random() * Math.PI * 2;
        const dist = 300 + Math.random() * 200;
        const x = playerObj.x + Math.cos(angle) * dist;
        const y = playerObj.y + Math.sin(angle) * dist;

        // เลือก enemy type แบบสุ่ม (type 1-9)
        const randomType = Math.floor(Math.random() * 9) + 1;
        spawnEnemy(x, y, randomType);
    }

    // เมื่อเวฟจบลง
    waveComplete() {
        console.log(`✅ Wave ${this.currentWave} completed!`);
        this.isWaveActive = false;
        this.currentWave++;
        if (typeof this.onWaveComplete === 'function') {
            this.isShopOpen = true;
            this.onWaveComplete(this.currentWave - 1);
        } else {
            this.startWave(this.currentWave);
        }
    }

    // ฟังก์ชันส่วนเสริมเพื่อสร้างมอนอัตโนมัติ (เรียกจาก GameTest.html)
    // spawnSingleEnemy(playerObj) {
    //     if (!playerObj) return;

    //     const angle = Math.random() * Math.PI * 2;
    //     const dist = 300 + Math.random() * 200;
    //     const x = playerObj.x + Math.cos(angle) * dist;
    //     const y = playerObj.y + Math.sin(angle) * dist;

    //     // เลือก enemy type แบบสุ่ม (type 1-9)
    //     const randomType = Math.floor(Math.random() * 9) + 1;
    //     spawnEnemy(x, y, randomType);
    // }

    // Spawn บอสตัวเดียว (called เมื่อเวฟเสร็จการ spawn มอนทั่วไป)
    spawnBoss(playerObj) {
        if (!playerObj || !this.hasBoss(this.currentWave)) return;

        const angle = Math.random() * Math.PI * 2;
        const x = playerObj.x + Math.cos(angle) * 500;
        const y = playerObj.y + Math.sin(angle) * 500;

        // เลือก boss type (10-14) ตามหมายเลขเวฟ
        const bossType = 10 + Math.floor((this.currentWave - 1)) % 5;
        spawnEnemy(x, y, bossType);
        console.log(`👹 Boss ${bossType} spawned for Wave ${this.currentWave}!`);
    }

    getDisplayText() {
        if (!this.hasSpawned) {
            // Countdown ตอนเตรียม
            const countdownSec = Math.ceil(Math.max(0, this.countdownTimer));
            return `Wave ${this.currentWave} | Ready: ${countdownSec}...`;
        }

        // แสดงเวลาที่เหลือใน Wave
        const displayTimer = Math.max(0, this.waveTimer);
        const mins = Math.floor(displayTimer / 60);
        const secs = Math.ceil(displayTimer % 60);
        return `Wave ${this.currentWave} | Time: ${mins}:${secs < 10 ? '0' + secs : secs}`;
    }
}
