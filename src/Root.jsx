import { Composition } from "remotion";
import { TestComposition } from "./Composition.jsx";

export const RemotionRoot = () => {
  return (
    <Composition
      id="TestComposition"
      component={TestComposition}
      durationInFrames={90}
      fps={30}
      width={1280}
      height={720}
    />
  );
};
