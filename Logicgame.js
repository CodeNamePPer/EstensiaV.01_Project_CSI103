class Logicgame {
    constructor() {
        this.level = 1;
        this.xp = 0;
        this.maxXP = 10;
        this.coin = 0;
        this.enemyCount = 0;
        this.wavetime = 45;
        this.player = null;
        this.levelManager = new LevelManager(this);
        this.onXPChanged = null;
        this.onCoinChanged = null;
        // callback — ให้ GameTest.html กำหนดเองว่าจะทำอะไรตอน level up
        this.onLevelUp = null;
    }
    addcoin(amount) {
        this.coin += amount;
        if (this.player) {
            this.player.coin = this.coin; // อัพเดตค่า coin ใน player ด้วย
        }
        console.log('Coins added:', amount, '| Total Coins:', this.coin);
        if (this.onCoinChanged) this.onCoinChanged();
    }
    addXP(amount) {
        this.xp += amount;
        console.log('XP added:', amount, '| Total XP:', this.xp, '/', this.maxXP);

        while (this.xp >= this.maxXP) {
            this.xp -= this.maxXP;
            this.doLevelUp(); // เปลี่ยนชื่อหลีกเลี่ยงชนกัน
        }
        if (this.onXPChanged) this.onXPChanged(); // callback สำหรับอัพเดต UI XP bar
    }

    doLevelUp() {
        this.level++;
        this.maxXP = Math.floor(this.maxXP * 1.2); // XP ที่ต้องการเพิ่มขึ้นทุก level
        console.log(`Level Up! ระดับ: ${this.level}, maxXP: ${this.maxXP}`);
        
        if (this.onLevelUp) this.onLevelUp(this.level);
    }

    reset() {
        this.level = 1;
        this.xp = 0;
        this.maxXP = 10;
        this.coin = 0;
        this.enemyCount = 0;
        this.levelManager.clear();
    }

    update() {
        if (this.levelManager) {
            this.levelManager.update();
        }
    }
}