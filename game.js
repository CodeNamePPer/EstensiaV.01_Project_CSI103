
const CHARACTERS = [
  {
    name: "Swordman",
    side: [
      "images/char1/side1.png",
      "images/char1/side2.png",
      "images/char1/side3.png",
      "images/char1/side4.png",
    ],
    up: [
      "images/char1/up1.png",
      "images/char1/up2.png",
      "images/char1/up3.png",
      "images/char1/up4.png",
    ],
  },
  {
    name: "Shooter",
    side: [
      "images/char2/side1.png",
      "images/char2/side2.png",
      "images/char2/side3.png",
      "images/char2/side4.png",
    ],
    up: [
      "images/char2/up1.png",
      "images/char2/up2.png",
      "images/char2/up3.png",
      "images/char2/up4.png",
    ],
  },
  {
    name: "Mage",
    side: [
      "images/char3/side1.png",
      "images/char3/side2.png",
      "images/char3/side3.png",
      "images/char3/side4.png",
    ],
    up: [
      "images/char3/up1.png",
      "images/char3/up2.png",
      "images/char3/up3.png",
      "images/char3/up4.png",
    ],
  },
  {
    name: "Gunslinger",
    side: [
      "images/char4/side1.png",
      "images/char4/side2.png",
      "images/char4/side3.png",
      "images/char4/side3.png",
    ],
    up: [
      "images/char4/up1.png",
      "images/char4/up2.png",
      "images/char4/up3.png",
      "images/char4/up4.png",
    ],
  },
];

// ============================================================
// PRELOAD all images
// ============================================================
CHARACTERS.forEach(ch => {
  [...ch.side, ...ch.up].forEach(src => {
    const img = new Image();
    img.src = src;
  });
});

// ============================================================
// GAME STATE
// ============================================================
const SPEED    = 3;
const FPS      = 8;
const FRAME_MS = 1000 / FPS;

let currentCharIndex = 0;

const char  = document.getElementById("character");
const world = document.getElementById("world");

let x = 352, y = 190;
let currentFrame  = 0;
let lastFrameTime = 0;
let facingLeft    = false;
let direction     = "side";

function getAnim() {
  return CHARACTERS[currentCharIndex];
}

// Set initial sprite
char.src        = getAnim().side[0];
char.style.left = x + "px";
char.style.top  = y + "px";

// ============================================================
// KEYBOARD INPUT
// ============================================================
const keys = {};
document.addEventListener("keydown", e => { keys[e.key.toLowerCase()] = true;  e.preventDefault(); });
document.addEventListener("keyup",   e => { keys[e.key.toLowerCase()] = false; });

// ============================================================
// CHARACTER SELECTOR UI
// ============================================================
function buildSelector() {
  const existing = document.getElementById("char-selector");
  if (existing) existing.remove();

  const wrap = document.createElement("div");
  wrap.id = "char-selector";
  wrap.style.cssText = "display:flex;gap:8px;margin-top:12px;justify-content:center;";

  CHARACTERS.forEach((ch, i) => {
    const btn = document.createElement("button");
    btn.textContent = ch.name;
    btn.style.cssText = `
      background:${i === currentCharIndex ? "#4a9eff" : "#222"};
      color:${i === currentCharIndex ? "#fff" : "#aaa"};
      border:1px solid #444;border-radius:6px;
      padding:6px 14px;font-size:13px;cursor:pointer;
      transition:background 0.15s;
    `;
    btn.addEventListener("click", () => {
      currentCharIndex = i;
      currentFrame     = 0;
      lastFrameTime    = 0;
      char.src         = getAnim().side[0];
      buildSelector();
    });
    wrap.appendChild(btn);
  });

  const hint = document.getElementById("hint");
  hint.insertAdjacentElement("afterend", wrap);
}

buildSelector();

// ============================================================
// MAIN LOOP
// ============================================================
function loop(now) {
  const ww = world.clientWidth  - char.clientWidth;
  const wh = world.clientHeight - char.clientHeight;

  let moving    = false;
  let newDir    = direction;
  let newFacing = facingLeft;

  if (keys["w"] || keys["arrowup"])    { y -= SPEED; moving = true; newDir = "up";   }
  if (keys["s"] || keys["arrowdown"])  { y += SPEED; moving = true; newDir = "up";   }
  if (keys["a"] || keys["arrowleft"])  { x -= SPEED; moving = true; newDir = "side"; newFacing = true;  }
  if (keys["d"] || keys["arrowright"]) { x += SPEED; moving = true; newDir = "side"; newFacing = false; }

  if (newDir !== direction) { currentFrame = 0; lastFrameTime = 0; }
  direction  = newDir;
  facingLeft = newFacing;

  x = Math.max(0, Math.min(x, ww));
  y = Math.max(0, Math.min(y, wh));

  char.style.left      = x + "px";
  char.style.top       = y + "px";
  char.style.transform = (direction === "side" && facingLeft) ? "scaleX(-1)" : "none";

  if (moving && now - lastFrameTime >= FRAME_MS) {
    currentFrame  = (currentFrame + 1) % getAnim()[direction].length;
    char.src      = getAnim()[direction][currentFrame];
    lastFrameTime = now;
  }

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);