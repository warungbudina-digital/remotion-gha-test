import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import fs from "fs";

const outDir = path.join(process.cwd(), "out");
fs.mkdirSync(outDir, { recursive: true });

const bundleLocation = await bundle({
  entryPoint: path.join(process.cwd(), "src/index.jsx"),
});

const composition = await selectComposition({
  serveUrl: bundleLocation,
  id: "CarouselOmega3",
});

const start = Date.now();
await renderMedia({
  composition,
  serveUrl: bundleLocation,
  codec: "h264",
  outputLocation: path.join(outDir, "carousel-omega3.mp4"),
  chromiumOptions: { ignoreCertificateErrors: true },
});
const stat = fs.statSync(path.join(outDir, "carousel-omega3.mp4"));
console.log(`RENDER SUKSES: carousel-omega3.mp4 ${stat.size} bytes, ${Date.now() - start}ms`);
