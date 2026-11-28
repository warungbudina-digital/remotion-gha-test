// render-repro.mjs -- render composition "ReproFromIR" dari file props yang
// dihasilkan ir_to_remotion.py (repo viral-pipeline). Analog render-carousel.mjs
// tapi inputProps DINAMIS (baca dari file), bukan hardcoded import.
//
// Pakai: node render-repro.mjs <props.json> [nama-output.mp4]
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import fs from "fs";

const propsPath = process.argv[2];
if (!propsPath) {
  console.error("Pakai: node render-repro.mjs <props.json> [nama-output.mp4]");
  process.exit(1);
}
const outName = process.argv[3] || "repro.mp4";

const inputProps = JSON.parse(fs.readFileSync(propsPath, "utf-8"));

const outDir = path.join(process.cwd(), "out");
fs.mkdirSync(outDir, { recursive: true });

const bundleLocation = await bundle({
  entryPoint: path.join(process.cwd(), "src/index.jsx"),
});

// PENTING: inputProps WAJIB diteruskan ke selectComposition DAN renderMedia --
// kalau cuma satu, calculateMetadata jalan dengan defaultProps (fixture), bukan
// data video asli, dan durasi/dimensi hasil render jadi salah.
const composition = await selectComposition({
  serveUrl: bundleLocation,
  id: "ReproFromIR",
  inputProps,
});

const start = Date.now();
await renderMedia({
  composition,
  serveUrl: bundleLocation,
  inputProps,
  codec: "h264",
  outputLocation: path.join(outDir, outName),
  chromiumOptions: { ignoreCertificateErrors: true },
});
const stat = fs.statSync(path.join(outDir, outName));
console.log(
  `RENDER SUKSES: ${outName} ${stat.size} bytes, ${Date.now() - start}ms, ` +
    `durationInFrames=${composition.durationInFrames}, ${composition.width}x${composition.height}`
);
