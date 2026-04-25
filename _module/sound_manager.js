// sound_manager.js
// Handles playing sound effects that respect the user's saved volume setting.

import { getSetting } from './settings_manager.js';

// Resolve the path relative to this module file so it works correctly
// regardless of which HTML page imports it.
const CLICK_SFX = new URL('../sfx/clicksound.mp3', import.meta.url).href;

/**
 * Plays the button-click sound at the current saved volume level.
 * Silently does nothing if volume is 0 or the browser blocks autoplay.
 */
export function playClick() {
    const volume = Number(getSetting('soundVolume'));
    if (volume === 0) return;
    const audio = new Audio(CLICK_SFX);
    audio.volume = Math.max(0, Math.min(1, volume / 100));
    audio.play().catch(() => {
        // Silently ignore autoplay-policy errors before user interaction.
    });
}

/**
 * Creates and returns an Audio object configured for looping with the current saved volume.
 * @param {string} path - The relative path to the audio file from this module.
 * @returns {HTMLAudioElement}
 */
export function createLoopingAudio(path) {
    const volume = Number(getSetting('soundVolume'));
    const url = new URL(path, import.meta.url).href;
    console.log(`[SoundManager] Loading looping audio: ${url} (Volume: ${volume})`);
    const audio = new Audio(url);
    audio.volume = Math.max(0, Math.min(1, volume / 100));
    audio.loop = true;
    audio.preload = 'auto';
    
    audio.addEventListener('error', (e) => {
        console.error(`[SoundManager] Error loading audio: ${url}`, e);
    });

    return audio;
}
