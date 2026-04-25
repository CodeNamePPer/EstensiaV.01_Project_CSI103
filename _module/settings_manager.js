// settings_manager.js
// Manages persistent game settings via localStorage.

const STORAGE_PREFIX = 'p101_setting_';

const DEFAULTS = {
    soundVolume: 100,
    sensitivity: 100,
    controls: {
        "Move up": "W",
        "Move down": "S",
        "Move right": "D",
        "Move left": "A"
    }
};

/**
 * Retrieves a setting value from localStorage.
 * Returns the default value if the setting has never been saved.
 * @param {string} key - e.g. 'soundVolume', 'sensitivity', 'controls'
 * @returns {*} The stored or default value.
 */
export function getSetting(key) {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw === null) return DEFAULTS[key];
    try {
        return JSON.parse(raw);
    } catch {
        return raw;
    }
}

/**
 * Saves a setting value to localStorage.
 * @param {string} key - The setting key.
 * @param {*} value - The value to save (will be JSON-serialised).
 */
export function saveSetting(key, value) {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
}

/**
 * Returns a fresh copy of all default settings.
 */
export function getDefaults() {
    return {
        soundVolume: DEFAULTS.soundVolume,
        sensitivity: DEFAULTS.sensitivity,
        controls: { ...DEFAULTS.controls }
    };
}
