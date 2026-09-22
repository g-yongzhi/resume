import { readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svgPath = join(root, "public/apple-touch-icon.svg");
const pngPath = join(root, "public/apple-touch-icon.png");

const svg = await readFile(svgPath);
const resvg = new Resvg(svg, {
  fitTo: { mode: "width", value: 180 },
  font: { loadSystemFonts: true },
});
const png = resvg.render();
await writeFile(pngPath, png.asPng());
console.log("Wrote", pngPath, `${png.width}x${png.height}`);
