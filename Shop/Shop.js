window.applyShopUpgrade = function (title, shopDeck) {
    if (title.includes('Buff Random')) {
        const buffs = ['Attack', 'Health', 'Speed', 'Cooldown', 'Amount', 'Armored'];
        const randomBuff = buffs[Math.floor(Math.random() * buffs.length)];
        if (typeof window.applyLevelUp === 'function') window.applyLevelUp(randomBuff);
        console.log('Buffed:', randomBuff);
    } else if (title.includes('Coin / EXP Random')) {
        if (Math.random() < 0.5) {
            if (typeof Logicgame101 !== 'undefined') Logicgame101.addXP(Math.floor(Logicgame101.maxXP * 0.5));
        } else {
            if (typeof Logicgame101 !== 'undefined') {
                Logicgame101.coin += 50;
                if (document.getElementById('ui-coin')) document.getElementById('ui-coin').innerText = Logicgame101.coin;
                if (shopDeck) {
                    shopDeck.coin = Logicgame101.coin;
                    if(document.querySelector('#coinCount')) document.querySelector('#coinCount').textContent = shopDeck.coin;
                }
            }
        }
    } else if (title.includes('Piercing Bullets')) {
        if (typeof playerData !== 'undefined') playerData.pierce = (playerData.pierce || 0) + 1;
    } else if (title.includes('Store discount')) {
        if (shopDeck) shopDeck.cost = Math.max(0, shopDeck.cost - 5);
    } else if (title.includes('Free spin')) {
        if (shopDeck) {
            shopDeck.freeSpins = (shopDeck.freeSpins || 0) + 2;
            if (shopDeck.messageBox) shopDeck.messageBox.textContent = `Got 2 Free Spins! Total: ${shopDeck.freeSpins}`;
        }
    } else if (title.includes('Re-armor')) {
        if (typeof playerData !== 'undefined') playerData.shieldRechargeRate = (playerData.shieldRechargeRate || 5) * 0.8;
    } else if (title.includes('More Drop')) {
        if (typeof playerData !== 'undefined') playerData.dropMultiplier = (playerData.dropMultiplier || 1) + 0.5;
    }
};

window.loadShopUI = function() {
    fetch('Shop.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            document.body.insertAdjacentHTML('beforeend', html);
            // Initialize Shop UI via UpgradeDeck (buy.js)
            const deck = new UpgradeDeck({
                cardsContainer: document.querySelector('.cards'),
                refreshButton: document.getElementById('refreshBtn'),
                buyButton: document.getElementById('buyBtn'),
                closeButton: document.getElementById('closeBtn'),
                messageBox: document.getElementById('messageBox')
            });
            deck.renderCards();
        })
        .catch(err => {
            console.error('Failed to load Shop.html:', err);
        });
};
