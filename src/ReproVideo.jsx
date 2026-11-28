// ReproVideo -- composition DATA-DRIVEN ("ReproFromIR"), beda dari CarouselVideo
// yang hardcoded. Props datang dari ir_to_remotion.py (lihat viral-pipeline repo).
//
// KONTRAK: file ini cuma peduli TAMPILAN (warna/font/animasi/posisi). Timing
// (from_frame/duration_frames) murni dibaca dari props, tidak pernah dihitung
// ulang di sini -- revisi apa pun di file ini TIDAK bisa mengubah struktur/
// durasi video sumber. Lihat plan nifty-launching-hamming.md untuk kontrak penuh.
//
// Latar SENGAJA flat green-screen (bukan footage/Blob CarouselVideo.jsx) --
// `phases` di sini cuma dipakai untuk flag `hook` (penekanan visual caption di
// fase pembuka), BUKAN untuk ubah warna latar (itu harus tetap satu warna biar
// bisa di-key ffmpeg `chromakey` belakangan).
import { AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame } from "remotion";
import { loadFont as loadSans } from "@remotion/google-fonts/Montserrat";

const { fontFamily: sansFont } = loadSans();

const GREEN = "#00FF00"; // chroma-key hijau standar -- ganti di sini kalau perlu shade lain
const HOOK_ACCENT = "#FFD400"; // satu-satunya pembeda visual fase hook (latar tak bisa berubah warna)

const CaptionFrame = ({ children, durationInFrames }) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, Math.min(8, durationInFrames)], [0, 1], {
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [Math.max(durationInFrames - 8, 0), durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const scale = spring({ frame, fps: 30, config: { damping: 14 } });
  return (
    <div style={{ opacity: Math.min(fadeIn, fadeOut), transform: `scale(${scale})` }}>
      {children}
    </div>
  );
};

const CaptionLine = ({ text, durationInFrames, width, height, hook }) => {
  const fontSize = Math.round(height * (hook ? 0.09 : 0.075));
  const strokeWidth = Math.max(2, Math.round(fontSize * 0.06));
  return (
    <AbsoluteFill
      style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: height * 0.12 }}
    >
      <CaptionFrame durationInFrames={durationInFrames}>
        <div
          style={{
            fontFamily: sansFont,
            fontWeight: 800,
            fontSize,
            lineHeight: 1.2,
            textAlign: "center",
            color: hook ? HOOK_ACCENT : "#FFFFFF",
            WebkitTextStroke: `${strokeWidth}px #000000`,
            paintOrder: "stroke fill",
            maxWidth: width * 0.86,
            padding: `0 ${width * 0.04}px`,
          }}
        >
          {text}
        </div>
      </CaptionFrame>
    </AbsoluteFill>
  );
};

const ProgressDots = ({ active, total }) => (
  <div
    style={{
      position: "absolute",
      bottom: 24,
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: "center",
      gap: 8,
    }}
  >
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        style={{
          width: i === active ? 18 : 8,
          height: 8,
          borderRadius: 4,
          background: i === active ? "#000000" : "rgba(0,0,0,0.35)",
        }}
      />
    ))}
  </div>
);

export const ReproVideo = ({ width, height, captions, phases }) => {
  const frame = useCurrentFrame();
  const activePhaseIndex = phases.findIndex(
    (p) => frame >= p.from_frame && frame < p.from_frame + p.duration_frames
  );
  const hookPhase = phases.find((p) => p.hook);
  const isInHook = (c) =>
    !!hookPhase &&
    c.from_frame >= hookPhase.from_frame &&
    c.from_frame < hookPhase.from_frame + hookPhase.duration_frames;

  return (
    <AbsoluteFill style={{ background: GREEN }}>
      {captions.map((c, i) => (
        <Sequence key={i} from={c.from_frame} durationInFrames={c.duration_frames}>
          <CaptionLine
            text={c.text}
            durationInFrames={c.duration_frames}
            width={width}
            height={height}
            hook={isInHook(c)}
          />
        </Sequence>
      ))}
      <ProgressDots active={activePhaseIndex} total={phases.length} />
    </AbsoluteFill>
  );
};
