export type SfxName =
  | "chat-pop"
  | "camera-shutter"
  | "paper-flip"
  | "stamp-claim"
  | "vinyl-needle"
  | "quiz-ding"
  | "party-cheer"
  | "gong-jawa"
  | "rindik-bali"
  | "gong-chinese"
  | "midnight-celesta";

const SFX_URLS: Record<SfxName, string> = {
  "chat-pop": "/audio/sfx/chat-pop.mp3",
  "camera-shutter": "/audio/sfx/camera-shutter.mp3",
  "paper-flip": "/audio/sfx/paper-flip.mp3",
  "stamp-claim": "/audio/sfx/stamp-claim.mp3",
  "vinyl-needle": "/audio/sfx/vinyl-needle.mp3",
  "quiz-ding": "/audio/sfx/quiz-ding.mp3",
  "party-cheer": "/audio/sfx/party-cheer.mp3",
  "gong-jawa": "/audio/sfx/gong-jawa.mp3",
  "rindik-bali": "/audio/sfx/rindik-bali.mp3",
  "gong-chinese": "/audio/sfx/gong-chinese.mp3",
  "midnight-celesta": "/audio/sfx/midnight-celesta.mp3",
};

const SFX_VOLUMES: Record<SfxName, number> = {
  "chat-pop": 0.42,
  "camera-shutter": 0.48,
  "paper-flip": 0.46,
  "stamp-claim": 0.52,
  "vinyl-needle": 0.5,
  "quiz-ding": 0.44,
  "party-cheer": 0.45,
  "gong-jawa": 0.55,
  "rindik-bali": 0.52,
  "gong-chinese": 0.55,
  "midnight-celesta": 0.5,
};

const sfxCache = new Map<SfxName, HTMLAudioElement>();

function getSfxTemplate(name: SfxName): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  let template = sfxCache.get(name);
  if (!template) {
    template = new Audio(SFX_URLS[name]);
    template.preload = "auto";
    sfxCache.set(name, template);
  }
  return template;
}

export function playSfx(name: SfxName, volume?: number): void {
  const template = getSfxTemplate(name);
  if (!template) return;

  try {
    const instance = template.cloneNode(true) as HTMLAudioElement;
    instance.volume = volume ?? SFX_VOLUMES[name];
    instance.currentTime = 0;
    const promise = instance.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(() => {});
    }
  } catch {
    // Abaikan jika browser memblokir pemutaran sebelum interaksi pengguna.
  }
}
