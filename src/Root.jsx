import { Composition } from "remotion";
import { TestComposition } from "./Composition.jsx";
import { CarouselVideo, TOTAL_FRAMES } from "./CarouselVideo.jsx";
import { ReproVideo } from "./ReproVideo.jsx";

// Fixture kecil cuma supaya Studio preview "ReproFromIR" bisa dibuka tanpa file
// eksternal -- render NYATA selalu pakai inputProps dari ir_to_remotion.py
// (lewat render-repro.mjs), fixture ini TIDAK dipakai saat render asli.
const REPRO_FIXTURE_PROPS = {
  fps: 30,
  width: 1080,
  height: 1920,
  total_frames: 150,
  captions: [
    { from_frame: 0, duration_frames: 60, text: "Contoh caption baris pertama" },
    { from_frame: 60, duration_frames: 90, text: "Baris kedua sedikit lebih panjang" },
  ],
  phases: [{ from_frame: 0, duration_frames: 150, semantic: "unknown", hook: true }],
  cuts: [0, 75],
  strong_hook_timestamps_sec: [0],
};

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="TestComposition"
        component={TestComposition}
        durationInFrames={300}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="CarouselOmega3"
        component={CarouselVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ReproFromIR"
        component={ReproVideo}
        durationInFrames={1}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={REPRO_FIXTURE_PROPS}
        calculateMetadata={({ props }) => ({
          durationInFrames: props.total_frames,
          fps: props.fps,
          width: props.width,
          height: props.height,
        })}
      />
    </>
  );
};
