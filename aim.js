// aim.js
const AimSystem = {
    mouseX: 0,
    mouseY: 0,

    init(canvas) {
        const updateCoords = (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            let clientX, clientY;
            if (e.touches && e.touches[0]) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            this.mouseX = (clientX - rect.left) * scaleX;
            this.mouseY = (clientY - rect.top) * scaleY;
        };

        canvas.addEventListener('mousemove', updateCoords);
        canvas.addEventListener('touchstart', updateCoords);
        canvas.addEventListener('touchmove', updateCoords);
    },

    getAimDirection(playerX, playerY, cameraX, cameraY) {
        // Calculate world coordinates of the mouse
        const targetX = this.mouseX + cameraX;
        const targetY = this.mouseY + cameraY;
        
        let dx = targetX - playerX;
        let dy = targetY - playerY;
        
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) return { x: 1, y: 0 };
        return { x: dx / len, y: dy / len };
    }
};
