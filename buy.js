class UpgradeDeck {
  constructor({ cardsContainer, refreshButton, buyButton, closeButton, messageBox }) {
    this.cardsContainer = cardsContainer;
    this.refreshButton = refreshButton;
    this.buyButton = buyButton;
    this.closeButton = closeButton;
    this.messageBox = messageBox;
    this.selectedCard = null;
    const coinParam = this.getUrlParam('coin');
    const parsedCoin = coinParam !== null ? parseInt(coinParam, 10) : NaN;
    this.coin = Number.isNaN(parsedCoin) ? 1000 : parsedCoin;
    this.cost = 10;
    this.purchaseCost = 20;
    this.upgrades = [
      {
        title: 'Buff Random 20 coin',
        description: 'Gain a random magical enhancement for this run.',
        icon: 'img_buy/buff.png'
      },
      {
        title: 'Coin / EXP Random 20 coin',
        description: 'Get extra coins or experience to grow stronger.',
        icon: 'img_buy/coin.png'
      },
      {
        title: 'Piercing Bullets 20 coin',
        description: 'Your bullets pierce through multiple enemies.',
        icon: 'img_buy/piercing_bullets.png'
      },
      {
        title: 'Store discount 20 coin',
        description: 'Get a discount at the store.',
        icon: 'img_buy/sale.png'
      },
      {
        title: 'Free spin 20 coin',
        description: 'Got 2 free spins at the roulette.',
        icon: 'img_buy/spin.png'
      },
      {
        title: 'Re-armor 20 coin',
        description: 'Regenerate armor faster',
        icon: 'img_buy/armor.png'
      },
      {
        title: 'More Drop 20 coin',
        description: 'Increase Drop Exp and Coin.',
        icon: 'img_buy/sword.png'
      },
      {
        title: 'Health Boost 20 coin',
        description: 'Increase your maximum health.',
        icon: 'img_buy/heart.png'
      },
      {
        title: 'Bigger Bullets 20 coin',
        description: 'Increase your weapon size.',
        icon: 'img_buy/great_sword.png'
      }

    ];
    document.querySelector('#coinCount').textContent = this.coin;
    this.attachEvents();
  }

  getUrlParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  shuffle(array) {
    return array
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  }

  getRandomCard() {
    const index = Math.floor(Math.random() * this.upgrades.length);
    return this.upgrades[index];
  }

  renderCards() {
    this.cardsContainer.innerHTML = '';
    this.selectedCard = null;

    for (let i = 0; i < 3; i++) {
      const upgrade = this.getRandomCard();
      const card = document.createElement('div');
      card.className = 'card';
      card.dataset.title = upgrade.title;
      card.dataset.description = upgrade.description;
      card.dataset.icon = upgrade.icon;
      card.innerHTML = `
          <img src="${upgrade.icon}" class="icon" alt="${upgrade.title}">
          <div class="content">
            <h3>${upgrade.title}</h3>
            <p>${upgrade.description}</p>
          </div>
        `;
      card.addEventListener('mouseover', () => {
        card.style.borderColor = '#ff5d73'; // สีแดงเมื่อ hover
      });

      card.addEventListener('mouseout', () => {
        if (this.selectedCard !== card) {
          card.style.borderColor = '#3a3f5a'; // สีปกติเมื่อไม่ hover
        }
      });
      card.addEventListener('click', () => {
        const allCards = this.cardsContainer.querySelectorAll('.card');
        allCards.forEach(c => c.style.borderColor = '#3a3f5a');

        this.selectedCard = card;
        card.style.borderColor = '#0a5a34'; // สีเขียว
      });

      this.cardsContainer.appendChild(card);
    }
  }

  chooseRandomCard() {
    if (!this.selectedCard) {
      this.messageBox.textContent = 'Please select a card first.';
      return false;
    }

    const title = this.selectedCard.querySelector('h3').textContent;

    this.messageBox.textContent = `You bought: ${title}`;
    this.selectedCard = null;
    return true;
  }

  attachEvents() {

    this.refreshButton.addEventListener('click', () => {
      if (this.coin < this.cost) {
        this.messageBox.textContent = 'Not enough coins to refresh!';
        this.refreshButton.disabled = true;
        return;
      }

      this.coin -= this.cost;
      document.querySelector('#coinCount').textContent = this.coin;
      this.cost += 10; // เพิ่มราคาทุกครั้งที่รีเฟรช

      if (this.coin < this.cost) {
        this.messageBox.textContent = 'Not enough coins to refresh!';
        this.refreshButton.disabled = true;
      } else {
        this.messageBox.textContent = 'Refreshed shop 20 coin.';
      }

      console.log(this.cost, this.coin);
      this.renderCards();
    });

    this.buyButton.addEventListener('click', () => {
      const title = this.selectedCard ? this.selectedCard.querySelector('h3').textContent : null;
      const success = this.chooseRandomCard();
      if (!success) return;

      if (this.coin < this.purchaseCost) {
        this.messageBox.textContent = 'Not enough coins to buy!';
        return;
      }

      this.coin -= this.purchaseCost;
      document.querySelector('#coinCount').textContent = this.coin;
      if (window.gameLogic) {
        window.gameLogic.coin = this.coin;
      }

      if (title && typeof window.applyShopUpgrade === 'function') {
        window.applyShopUpgrade(title, this);
      }

      const panel = document.getElementById('buy-panel-container');
      if (panel) panel.classList.remove('show');

      if (window.waveManager) window.waveManager.isShopOpen = false;
      if (typeof window.onShopSessionEnded === 'function') {
        window.onShopSessionEnded();
      } else if (window.waveManager && typeof window.waveManager.startWave === 'function') {
        window.waveManager.startWave(window.waveManager.currentWave);
      }
    });

    if (this.closeButton) {
      this.closeButton.addEventListener('click', () => {
        const panel = document.getElementById('buy-panel-container');
        if (panel) panel.classList.remove('show');

        if (window.waveManager) window.waveManager.isShopOpen = false;
        if (typeof window.onShopSessionEnded === 'function') {
          window.onShopSessionEnded();
        } else if (window.waveManager && typeof window.waveManager.startWave === 'function') {
          window.waveManager.startWave(window.waveManager.currentWave);
        }
      });
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  if (!window.shopDeck) {
    const deck = new UpgradeDeck({
      cardsContainer: document.querySelector('.cards'),
      refreshButton: document.getElementById('refreshBtn'),
      buyButton: document.getElementById('buyBtn'),
      closeButton: document.getElementById('closeBtn'),
      messageBox: document.getElementById('messageBox')
    });

    deck.renderCards();
    window.shopDeck = deck;
  }
});