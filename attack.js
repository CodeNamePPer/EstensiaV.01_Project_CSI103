// attack.js
const projectiles = [];

const getWeaponConfig = (weaponName) => {
    const w = weaponName.replace('\n ', ''); // trim newline from Magic Wand
    if (w === 'Sword') return { type: 'melee', cooldown: 1.0, duration: 0.2, color: 'white', range: 60 };
    if (w === 'MagicWand' || w === 'Magic Wand') return { type: 'projectile', cooldown: 1.2, speed: 250, duration: 2.0, color: '#44f', size: 10 };
    if (w === 'Bow') return { type: 'projectile', cooldown: 0.8, speed: 450, duration: 1.5, color: '#8b4513', size: 6 };
    if (w === 'Gun') return { type: 'projectile', cooldown: 0.3, speed: 800, duration: 1.0, color: '#ffd700', size: 4 };
    return { type: 'melee', cooldown: 0.5, duration: 0.1, color: '#fcc', range: 40 }; // Fist
};

class AttackManager {
    static updatePlayerAttack(playerObj, playerData, dt) {
        playerObj.attackTimer += dt;
                
        const wConfig = getWeaponConfig(playerData.weapon);
        const cooldownMod = parseFloat(playerData.cooldown) || 0; 
        const finalCooldown = wConfig.cooldown * (1 + cooldownMod/100);

        if (playerObj.attackTimer >= finalCooldown) {
            playerObj.attackTimer = 0;
            playerObj.projectilesToShoot = 1 + (parseInt(playerData.amount) || 0);
            playerObj.currentAttackDelay = 0;
        }

        // Handle multi-shots
        if (playerObj.projectilesToShoot > 0) {
            playerObj.currentAttackDelay -= dt;
            if (playerObj.currentAttackDelay <= 0) {
                playerObj.projectilesToShoot--;
                playerObj.currentAttackDelay = 0.1; // 100ms between extra projectiles
                
                // Fire projectile
                this.fireAttack(playerObj, playerData, wConfig);
            }
        }
    }

    static fireAttack(playerObj, playerData, config) {
        let px = playerObj.x;
        let py = playerObj.y;
        let vx = playerObj.facingDir.x;
        let vy = playerObj.facingDir.y;

        // Normalize velocity
        const len = Math.sqrt(vx*vx + vy*vy);
        if (len === 0) { vx = 1; vy = 0; }
        else { vx /= len; vy /= len; }

        if (config.type === 'projectile') {
            // Magic wand shoots random
            if (playerData.weapon.includes('Magic')) {
                const angle = Math.random() * Math.PI * 2;
                vx = Math.cos(angle);
                vy = Math.sin(angle);
            }
            
            projectiles.push({
                x: px, y: py,
                vx: vx * config.speed, vy: vy * config.speed,
                lifetime: config.duration,
                config: config,
                damage: playerData.atk
            });
        } else if (config.type === 'melee') {
            // Melee attack stays at player position + offset
            const offset = 30;

            projectiles.push({
                offsetX: vx * offset, offsetY: vy * offset,
                dx: vx, dy: vy,
                lifetime: config.duration,
                config: config,
                isMelee: true,
                damage: playerData.atk
            });
        }
    }

    static updateProjectiles(dt, playerObj) {
        for (let i = projectiles.length - 1; i >= 0; i--) {
            let p = projectiles[i];
            p.lifetime -= dt;
            if (p.lifetime <= 0) {
                projectiles.splice(i, 1);
                continue;
            }
            
            if (!p.isMelee) {
                p.x += p.vx * dt;
                p.y += p.vy * dt;
            } else {
                p.x = playerObj.x + p.offsetX;
                p.y = playerObj.y + p.offsetY;
            }
        }
    }

    static drawProjectiles(ctx, camera) {
        projectiles.forEach(p => {
            ctx.save();
            const sx = p.x - camera.x;
            const sy = p.y - camera.y;
            
            ctx.fillStyle = p.config.color || '#fff';
            ctx.globalAlpha = Math.min(1, p.lifetime * 4); // fade out
            ctx.translate(sx, sy);
            
            if (p.isMelee) {
                // Draw arc/slash
                const angle = Math.atan2(p.dy, p.dx);
                ctx.rotate(angle);
                ctx.beginPath();
                ctx.arc(0, 0, p.config.range, -Math.PI/3, Math.PI/3);
                ctx.strokeStyle = p.config.color;
                ctx.lineWidth = 15;
                ctx.stroke();
            } else {
                // Draw projectile
                ctx.rotate(Math.atan2(p.vy, p.vx));
                ctx.fillRect(-p.config.size, -p.config.size/2, p.config.size*2, p.config.size);
            }
            
            ctx.restore();
        });
    }
}
