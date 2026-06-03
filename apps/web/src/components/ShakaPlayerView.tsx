import { useEffect, useRef, useState } from 'react';
import shaka from 'shaka-player/dist/shaka-player.compiled.js';

type ShakaPlayerViewProps = {
  src: string;
};

/** Errors caused by React StrictMode teardown or player cleanup — not user-facing failures. */
const IGNORABLE_SHAKA_CODES = new Set([7000, 7001, 7002, 7003]);

let polyfillsInstalled = false;

function installPolyfillsOnce() {
  if (!polyfillsInstalled) {
    shaka.polyfill.installAll();
    polyfillsInstalled = true;
  }
}

function getShakaErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }
  if (typeof err === 'object' && err !== null && 'message' in err) {
    return String((err as { message: string }).message);
  }
  return 'Failed to load stream';
}

function isIgnorableShakaError(err: unknown): boolean {
  if (typeof err !== 'object' || err === null || !('code' in err)) {
    return false;
  }
  return IGNORABLE_SHAKA_CODES.has(Number((err as { code: number }).code));
}

export function ShakaPlayerView({ src }: ShakaPlayerViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    installPolyfillsOnce();

    const video = videoRef.current;
    if (!video) {
      return;
    }

    let cancelled = false;
    const player = new shaka.Player(video);

    void (async () => {
      try {
        setError(null);
        await player.load(src);
        if (!cancelled) {
          void video.play().catch(() => {
            /* autoplay may be blocked; user can press play */
          });
        }
      } catch (err) {
        if (cancelled || isIgnorableShakaError(err)) {
          return;
        }
        setError(getShakaErrorMessage(err));
      }
    })();

    return () => {
      cancelled = true;
      void player.destroy().catch(() => undefined);
    };
  }, [src]);

  return (
    <div className="space-y-3">
      <video
        ref={videoRef}
        className="aspect-video w-full rounded-lg bg-black"
        controls
        autoPlay
        playsInline
      />
      {error && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
