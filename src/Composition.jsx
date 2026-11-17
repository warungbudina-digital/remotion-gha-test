import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

export const TestComposition = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const scale = interpolate(frame, [0, durationInFrames], [0.9, 1.1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#1a1a2e",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          color: "#e94560",
          fontSize: 70,
          fontFamily: "sans-serif",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        HF Space Render Test
        <div style={{ fontSize: 32, color: "#eeeeee", marginTop: 20 }}>
          frame {frame}
        </div>
      </div>
    </AbsoluteFill>
  );
};
