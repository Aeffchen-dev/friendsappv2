/**
 * Haptic feedback utility for mobile devices
 * Uses the Web Vibration API for Android and input[switch] trick for iOS Safari
 */

type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const hapticPatterns: Record<HapticStyle, number | number[]> = {
  light: 10,           // Quick, subtle tap
  medium: 20,          // Standard feedback
  heavy: 30,           // Strong feedback
  success: [10, 50, 10], // Double tap pattern
  warning: 40,         // Longer single vibration
  error: [20, 50, 20, 50, 20], // Multiple vibrations
};

// Check if device supports haptics (coarse pointer = touch device)
const supportsHaptics = typeof window !== 'undefined' 
  ? window.matchMedia('(pointer: coarse)').matches 
  : false;

/**
 * Trigger a single haptic feedback using iOS Safari trick
 * Creates a hidden switch input and toggles it to trigger haptic
 */
function triggerIOSHaptic() {
  try {
    if (!supportsHaptics) return;

    const labelEl = document.createElement('label');
    labelEl.ariaHidden = 'true';
    labelEl.style.display = 'none';

    const inputEl = document.createElement('input');
    inputEl.type = 'checkbox';
    inputEl.setAttribute('switch', '');
    labelEl.appendChild(inputEl);

    document.head.appendChild(labelEl);
    labelEl.click();
    document.head.removeChild(labelEl);
  } catch (error) {
    // Silently fail
    console.debug('iOS haptic not available:', error);
  }
}

/**
 * Trigger haptic feedback on supported devices
 * @param style - The style of haptic feedback to trigger
 */
export const triggerHaptic = (style: HapticStyle = 'light') => {
  try {
    // Try vibration API first (works on Android)
    if (navigator.vibrate) {
      const pattern = hapticPatterns[style];
      navigator.vibrate(pattern);
      return;
    }

    // Fallback to iOS Safari trick
    switch (style) {
      case 'light':
        triggerIOSHaptic();
        break;
      case 'medium':
        triggerIOSHaptic();
        break;
      case 'heavy':
        triggerIOSHaptic();
        setTimeout(() => triggerIOSHaptic(), 50);
        break;
      case 'success':
        triggerIOSHaptic();
        setTimeout(() => triggerIOSHaptic(), 120);
        break;
      case 'warning':
        triggerIOSHaptic();
        setTimeout(() => triggerIOSHaptic(), 50);
        break;
      case 'error':
        triggerIOSHaptic();
        setTimeout(() => triggerIOSHaptic(), 120);
        setTimeout(() => triggerIOSHaptic(), 240);
        break;
    }
  } catch (error) {
    // Silently fail if haptic is not supported or blocked
    console.debug('Haptic feedback not available:', error);
  }
};

/**
 * Cancel any ongoing vibration
 */
export const cancelHaptic = () => {
  if (navigator.vibrate) {
    navigator.vibrate(0);
  }
};
