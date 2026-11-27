import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import path from "path";
import fs from "fs";

const start = Date.now();
const outDir = path.join(process.cwd(), "out");
fs.mkdirSync(outDir, { recursive: true });
const log = (msg) => {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(path.join(outDir, "render.log"), line + "\n");
};

try {
  log("mulai bundle...");
  const bundleLocation = await bundle({
    entryPoint: path.join(process.cwd(), "src/index.jsx"),
  });
  log(`bundle selesai (${Date.now() - start}ms)`);

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: "TestComposition",
  });
  log("composition dipilih: " + composition.id);

  const renderStart = Date.now();
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation: path.join(outDir, "output.mp4"),
    chromiumOptions: {
      ignoreCertificateErrors: true,
    },
  });
  const renderMs = Date.now() - renderStart;
  const totalMs = Date.now() - start;
  const stat = fs.statSync(path.join(outDir, "output.mp4"));
  log(`RENDER SUKSES: output.mp4 ${stat.size} bytes, render=${renderMs}ms total=${totalMs}ms`);
  fs.writeFileSync(
    path.join(outDir, "status.json"),
    JSON.stringify({ ok: true, bytes: stat.size, render_ms: renderMs, total_ms: totalMs }, null, 2)
  );
} catch (err) {
  log("RENDER GAGAL: " + (err && err.stack ? err.stack : String(err)));
  fs.writeFileSync(
    path.join(outDir, "status.json"),
    JSON.stringify({ ok: false, error: String(err) }, null, 2)
  );
  process.exitCode = 1;
}
