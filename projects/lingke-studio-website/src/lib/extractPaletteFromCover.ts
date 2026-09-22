import type { CasePalette } from "../data/workCases";

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function rgbToHex(r: number, g: number, b: number): string {
  const h = (x: number) =>
    clamp(Math.round(x), 0, 255)
      .toString(16)
      .padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

function lum01(r: number, g: number, b: number) {
  const [R, G, B] = [r, g, b].map((c) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/**
 * 从同域封面图（public 路径）抽样主色，生成四色板，供案例子页背景与视觉识别使用。
 * 外站跨域图无法读像素，会返回 null。
 */
export function extractPaletteFromCover(imageSrc: string): Promise<CasePalette | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const done = (p: CasePalette | null) => {
      resolve(p);
    };

    img.onload = () => {
      try {
        const w = 40;
        const h = 40;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          done(null);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        let data: ImageData;
        try {
          data = ctx.getImageData(0, 0, w, h);
        } catch {
          done(null);
          return;
        }

        const step = 28;
        const buckets = new Map<string, { r: number; g: number; b: number; n: number }>();

        for (let i = 0; i < data.data.length; i += 4) {
          const a = data.data[i + 3];
          if (a < 16) continue;
          let r = data.data[i];
          let g = data.data[i + 1];
          let b = data.data[i + 2];
          r = Math.round(r / step) * step;
          g = Math.round(g / step) * step;
          b = Math.round(b / step) * step;
          const key = `${r},${g},${b}`;
          const cur = buckets.get(key);
          if (cur) {
            cur.r += data.data[i];
            cur.g += data.data[i + 1];
            cur.b += data.data[i + 2];
            cur.n += 1;
          } else {
            buckets.set(key, { r: data.data[i], g: data.data[i + 1], b: data.data[i + 2], n: 1 });
          }
        }

        const colors = [...buckets.values()]
          .map(({ r, g, b, n }) => ({
            r: r / n,
            g: g / n,
            b: b / n,
            n,
            L: lum01(r / n, g / n, b / n),
          }))
          .filter((c) => c.n >= 2)
          .sort((a, b) => b.n - a.n)
          .slice(0, 12);

        if (colors.length < 2) {
          done(null);
          return;
        }

        const sortedByL = [...colors].sort((a, b) => b.L - a.L);
        const paperC = sortedByL[0];
        const mistC = sortedByL[Math.min(2, sortedByL.length - 1)] ?? sortedByL[1];
        const darkPool = [...colors].sort((a, b) => a.L - b.L);
        let cinnabarC = darkPool[0];
        for (const c of darkPool) {
          const sat = Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b);
          const baseSat = Math.max(cinnabarC.r, cinnabarC.g, cinnabarC.b) - Math.min(cinnabarC.r, cinnabarC.g, cinnabarC.b);
          if (c.L < 0.55 && sat > baseSat * 0.85) cinnabarC = c;
        }

        let brassC = colors.find((c) => {
          if (c === paperC || c === cinnabarC) return false;
          const warm = c.r + c.g > 1.15 * (c.b + 1);
          return c.L > 0.25 && c.L < 0.72 && warm;
        });
        if (!brassC) brassC = sortedByL[Math.floor(sortedByL.length / 2)] ?? mistC;

        const paper = rgbToHex(paperC.r, paperC.g, paperC.b);
        const mist = rgbToHex(
          mix(mistC.r, paperC.r, 0.35),
          mix(mistC.g, paperC.g, 0.35),
          mix(mistC.b, paperC.b, 0.35),
        );
        let cR = cinnabarC.r;
        let cG = cinnabarC.g;
        let cB = cinnabarC.b;
        if (lum01(cR, cG, cB) > 0.42) {
          cR = mix(cR, 40, 0.55);
          cG = mix(cG, 32, 0.55);
          cB = mix(cB, 28, 0.55);
        }
        const cinnabar = rgbToHex(cR, cG, cB);
        const brass = rgbToHex(
          mix(brassC.r, cR, 0.12),
          mix(brassC.g, cG, 0.1),
          mix(brassC.b, cB, 0.08),
        );

        done({ paper, mist, cinnabar, brass });
      } catch {
        done(null);
      }
    };

    img.onerror = () => done(null);
    img.src = imageSrc;
  });
}
