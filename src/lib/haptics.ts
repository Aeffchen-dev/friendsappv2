/**
 * Haptic feedback utility for mobile devices
 * Uses the Web Vibration API for cross-platform haptic feedback
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

/**
 * Trigger haptic feedback on supported devices
 * @param style - The style of haptic feedback to trigger
 */
export const triggerHaptic = (style: HapticStyle = 'light') => {
  // Check if vibration API is supported
  if (!navigator.vibrate) {
    return;
  }

  try {
    const pattern = hapticPatterns[style];
    navigator.vibrate(pattern);
  } catch (error) {
    // Silently fail if vibration is not supported or blocked
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
