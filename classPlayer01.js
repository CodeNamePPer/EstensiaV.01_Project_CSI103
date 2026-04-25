// ตัวละคร
class Player {
    constructor(name, type) {
        this.name = name;
        this.type = type;
        this.coin = 0;
        this.setAttributes(type);
        this.hp = 0 + Number(this.maxHp);
        this.atk = 10 + Number(this.might);
        this.spd = 10 + Number(this.speed);
        this.baseSpd = this.spd; // Original speed before sensitivity
        this.cd = 2 + Number(this.cooldown);
        this.projectile = 0 + Number(this.amount);
        this.armored = 1 + Number(this.armor);
        this.magnetRange = 150; // ระยะดูดไอเทม (Magnet)
        this.baseStats = {
            hp: this.hp,
            atk: this.atk,
            spd: this.spd,
            cd: this.cd,
            projectile: this.projectile,
            armored: this.armored,
        };

    }
    resetStats() {
        this.hp = this.baseStats.hp;
        this.atk = this.baseStats.atk;
        this.spd = this.baseStats.spd;
        this.cd = this.baseStats.cd;
        this.projectile = this.baseStats.projectile;
        this.armored = this.baseStats.armored;
        this.coin = 0;
    }
    setAttributes(type) {
        // สเตตัสอ้างอิงจากระบบ Vampire Survivors
        switch (type) {
            case 'นักดาบ':
                this.maxHp = 400;
                this.weapon = 'Sword';
                this.icon = '🗡️';
                this.might = '35'; //Dmg Player
                this.speed = '0';
                this.cooldown = '-0';
                this.amount = '0';
                this.armor = 1;
                // บัฟต่อ level สำหรับนักดาบ
                this.levelUpBonus = { atk: 2, hp: 0, cd: -0.25, armor: 0 };
                // สเตตัสที่ได้ตอนเลือกอัพเลเวล
                this.levelUpStats = { atk: 3, hp: 50, spd: 2, cd: 0.05, prj: 0, arm: 2 };
                break;

            case 'นักเวท':
                this.maxHp = 3;
                this.weapon = 'Magic \n Wand';
                this.icon = '🪄';
                this.might = '15';
                this.speed = '-2';
                this.cooldown = '-0.2';
                this.amount = '0';
                this.armor = 0;
                // นักเวทได้ ATK เยอะแต่ HP น้อย
                this.levelUpBonus = { atk: 3, hp: 0, cd: 0, armor: 0 };
                // สเตตัสที่ได้ตอนเลือกอัพเลเวล
                this.levelUpStats = { atk: 6, hp: 1, spd: 4, cd: 0.1, prj: 1, arm: 0 };
                break;

            case 'นักธนู':
                this.maxHp = 3;
                this.weapon = 'Bow';
                this.icon = '🏹';
                this.might = '20';
                this.speed = '2';
                this.cooldown = '-0.5';
                this.amount = '1';
                this.armor = 0;
                // นักธนูได้ SPD เยอะ
                this.levelUpBonus = { atk: 1, hp: 0, cd: -0.1, armor: 0 };
                // สเตตัสที่ได้ตอนเลือกอัพเลเวล
                this.levelUpStats = { atk: 2, hp: 1, spd: 8, cd: 0.05, prj: 2, arm: 1 };
                break;

            case 'มือปืน':
                this.maxHp = 3;
                this.weapon = 'Gun';
                this.icon = '🔫';
                this.might = '10';
                this.speed = '1';
                this.cooldown = '-0.4';
                this.amount = '0';
                this.armor = 0;
                // มือปืนได้ ATK กับ SPD สมดุล
                this.levelUpBonus = { atk: 1, hp: 0, cd: -0.1, armor: 0 };
                // สเตตัสที่ได้ตอนเลือกอัพเลเวล
                this.levelUpStats = { atk: 4, hp: 1, spd: 5, cd: 0.08, prj: 1, arm: 1 };
                break;
        }
    }

    getSummary() {
        return `${this.name} (${this.type})`;
    }
}
