import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from "remotion";

const Particle = ({ index, frame, width, height }) => {
  const seed = index * 37.17;
  const speed = 0.6 + (index % 5) * 0.15;
  const radius = 16 + (index % 4) * 10;
  const hue = (index * 47 + frame * 1.5) % 360;

  const x = (Math.sin((frame * speed + seed) / 20) * 0.5 + 0.5) * (width - radius * 2) + radius;
  const y = (Math.cos((frame * speed * 0.8 + seed) / 25) * 0.5 + 0.5) * (height - radius * 2) + radius;

  return (
    <div
      style={{
        position: "absolute",
        left: x - radius,
        top: y - radius,
        width: radius * 2,
        height: radius * 2,
        borderRadius: "50%",
        background: `hsl(${hue}, 80%, 60%)`,
        boxShadow: `0 0 ${radius}px hsl(${hue}, 80%, 60%)`,
      }}
    />
  );
};

const Intro = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20, 70, 90], [0, 1, 1, 0], { extrapolateRight: "clamp" });
  const scale = spring({ frame, fps: 30, config: { damping: 12 } });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          color: "#fff",
          fontSize: 72,
          fontWeight: "bold",
          fontFamily: "sans-serif",
          textAlign: "center",
        }}
      >
        Uji Render Animasi
        <div style={{ fontSize: 28, color: "#ffd166", marginTop: 16 }}>
          GitHub Actions &middot; Remotion &middot; 10 detik
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Outro = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ opacity, color: "#06d6a0", fontSize: 60, fontWeight: "bold", fontFamily: "sans-serif" }}>
        Render Selesai
      </div>
    </AbsoluteFill>
  );
};

export const TestComposition = () => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  const hueShift = (frame * 0.8) % 360;
  const bg = `linear-gradient(135deg, hsl(${hueShift}, 50%, 15%), hsl(${(hueShift + 80) % 360}, 50%, 10%))`;

  const particleCount = 24;

  return (
    <AbsoluteFill style={{ background: bg }}>
      {Array.from({ length: particleCount }).map((_, i) => (
        <Particle key={i} index={i} frame={frame} width={width} height={height} />
      ))}

      <Sequence from={0} durationInFrames={90}>
        <Intro />
      </Sequence>

      <Sequence from={durationInFrames - 60} durationInFrames={60}>
        <Outro />
      </Sequence>

      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 30 }}>
        <div style={{ color: "rgba(255,255,255,0.6)", fontFamily: "monospace", fontSize: 20 }}>
          frame {frame} / {durationInFrames}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
