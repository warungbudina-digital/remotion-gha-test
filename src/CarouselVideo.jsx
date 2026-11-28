import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadSans } from "@remotion/google-fonts/Montserrat";
import { CAROUSEL_TITLE, SLIDES, SEGMENT_SECONDS } from "./carouselData";

const { fontFamily: serifFont } = loadSerif();
const { fontFamily: sansFont } = loadSans();

const COLORS = {
  bg: "#F5F0E6",
  sage: "#8FA37E",
  terracotta: "#C9A876",
  text: "#3E3A33",
};

const FPS = 30;
const toFrames = (sec) => Math.round(sec * FPS);

// 5 adegan = 5 berkas narasi nyata (INTRO/SEG1/SEG2/SEG3/OUTRO), BUKAN pembagian
// rata buatan -- durasi tiap adegan di bawah ini PERSIS mengikuti ffprobe narasi asli.
// 7 slide teks asli dipetakan ke 5 adegan ini (SEG2 dapat 2 slide krn narasinya
// yang terpanjang, 48 dtk).
const SCENES = [
  { key: "intro", frames: toFrames(SEGMENT_SECONDS.intro), slides: ["title", 0] },
  { key: "seg1", frames: toFrames(SEGMENT_SECONDS.seg1), slides: [1, 2] },
  { key: "seg2", frames: toFrames(SEGMENT_SECONDS.seg2), slides: [3, 4] },
  { key: "seg3", frames: toFrames(SEGMENT_SECONDS.seg3), slides: [5] },
  { key: "outro", frames: toFrames(SEGMENT_SECONDS.outro), slides: [6] },
];

export const TOTAL_FRAMES = SCENES.reduce((sum, s) => sum + s.frames, 0);

const Blob = ({ top, left, size, color, driftFrame, driftAmp = 14 }) => {
  const dy = Math.sin(driftFrame / 45) * driftAmp;
  return (
    <div
      style={{
        position: "absolute",
        top: top + dy,
        left,
        width: size,
        height: size * 0.82,
        background: color,
        opacity: 0.35,
        borderRadius: "48% 52% 55% 45% / 55% 45% 55% 45%",
        filter: "blur(1px)",
      }}
    />
  );
};

const ProgressDots = ({ active, total }) => (
  <div
    style={{
      position: "absolute",
      bottom: 46,
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: "center",
      gap: 10,
    }}
  >
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        style={{
          width: i === active ? 22 : 10,
          height: 10,
          borderRadius: 6,
          background: i === active ? COLORS.sage : "rgba(62,58,51,0.25)",
          transition: "width 200ms",
        }}
      />
    ))}
  </div>
);

const Frame = ({ children, frame, durationInFrames }) => {
  const fadeIn = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(
    frame,
    [Math.max(durationInFrames - 14, 0), durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const rise = interpolate(frame, [0, 16], [18, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: Math.min(fadeIn, fadeOut),
        transform: `translateY(${rise}px)`,
        padding: "0 110px",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const TitleBlock = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const scale = spring({ frame, fps: FPS, config: { damping: 14 } });
  return (
    <Frame frame={frame} durationInFrames={durationInFrames}>
      <div style={{ transform: `scale(${scale})`, textAlign: "center" }}>
        <div
          style={{
            fontFamily: serifFont,
            fontWeight: 700,
            fontSize: 58,
            lineHeight: 1.25,
            color: COLORS.text,
          }}
        >
          {CAROUSEL_TITLE}
        </div>
        <div
          style={{
            marginTop: 28,
            fontFamily: sansFont,
            fontSize: 22,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: COLORS.sage,
          }}
        >
          Yuni &middot; Sahabat Nutrilite
        </div>
      </div>
    </Frame>
  );
};

const SlideBlock = ({ durationInFrames, slide }) => {
  const frame = useCurrentFrame();
  return (
  <Frame frame={frame} durationInFrames={durationInFrames}>
    <div style={{ textAlign: "center", maxWidth: 980 }}>
      {slide.heading && (
        <div
          style={{
            fontFamily: serifFont,
            fontWeight: 700,
            fontSize: 46,
            color: COLORS.text,
            marginBottom: 22,
          }}
        >
          {slide.heading}
        </div>
      )}
      <div
        style={{
          fontFamily: sansFont,
          fontWeight: 500,
          fontSize: 30,
          lineHeight: 1.5,
          color: COLORS.text,
        }}
      >
        {slide.body}
      </div>
    </div>
  </Frame>
  );
};

export const CarouselVideo = () => {
  const frame = useCurrentFrame();

  let cursor = 0;
  const sceneRanges = SCENES.map((scene) => {
    const from = cursor;
    cursor += scene.frames;
    // bagi rata durasi adegan di antara blok-bloknya (1 atau 2 blok per adegan)
    const n = scene.slides.length;
    const per = Math.floor(scene.frames / n);
    let sub = 0;
    const blocks = scene.slides.map((s, i) => {
      const dur = i === n - 1 ? scene.frames - sub : per;
      const blockFrom = from + sub;
      sub += dur;
      return { s, from: blockFrom, dur };
    });
    return { ...scene, from, blocks };
  });

  const activeSceneIndex = sceneRanges.findIndex(
    (r) => frame >= r.from && frame < r.from + r.frames
  );

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <Audio src={staticFile("narration-omega3.mp3")} />

      <Blob top={-60} left={-80} size={420} color={COLORS.sage} driftFrame={frame} />
      <Blob top={700} left={880} size={380} color={COLORS.terracotta} driftFrame={frame + 60} driftAmp={10} />

      {sceneRanges.map((scene) =>
        scene.blocks.map(({ s, from, dur }, i) => (
          <Sequence key={`${scene.key}-${i}`} from={from} durationInFrames={dur}>
            {s === "title" ? (
              <TitleBlock durationInFrames={dur} />
            ) : (
              <SlideBlock durationInFrames={dur} slide={SLIDES[s]} />
            )}
          </Sequence>
        ))
      )}

      <ProgressDots active={activeSceneIndex} total={SCENES.length} />
    </AbsoluteFill>
  );
};
