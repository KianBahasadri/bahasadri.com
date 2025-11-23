let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (!audioContext) {
    const AudioContextClass =
      globalThis.AudioContext ||
      (globalThis as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (AudioContextClass) {
      audioContext = new AudioContextClass();
    }
  }
  return audioContext;
}

export function playClickSound(): void {
  const context = getAudioContext();
  if (!context) {
    return;
  }

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.frequency.value = 800;
  oscillator.type = "sine";

  gainNode.gain.setValueAtTime(0, context.currentTime);
  gainNode.gain.linearRampToValueAtTime(
    0.3,
    context.currentTime + 0.01
  );
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    context.currentTime + 0.05
  );

  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + 0.05);
}

