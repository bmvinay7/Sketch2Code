/**
 * Otsu's method for image binarization.
 *
 * Reference:
 *   Nobuyuki Otsu, "A Threshold Selection Method from Gray-Level Histograms",
 *   IEEE Transactions on Systems, Man, and Cybernetics, vol. 9, no. 1, 1979.
 *
 * Goal:
 *   Convert a grayscale image into pure black-and-white by picking the
 *   single threshold t* in [0, 255] that maximises between-class variance
 *   (equivalently, minimises within-class variance) over the pixel
 *   intensity histogram. For hand-drawn flowcharts photographed on paper,
 *   this strips lighting gradients and shadows so the downstream vision
 *   model sees clean strokes on a uniform background.
 *
 * Complexity:
 *   O(W*H) to build the histogram + O(L) over the L = 256 grey levels to
 *   scan for the optimal threshold. Memory is O(L). No allocations per
 *   pixel — runs comfortably in the browser on multi-megapixel images.
 */

const LEVELS = 256;

export interface OtsuResult {
  imageData: ImageData;
  threshold: number;
}

/**
 * Binarise an ImageData buffer in place-style (returns a new ImageData
 * so the original preview can be kept for the user).
 *
 * @param source RGBA ImageData from a 2D canvas
 * @returns the binarised ImageData and the chosen threshold (for debugging
 *          / displaying "preprocessed with t=NN" to the user).
 */
export function otsuBinarize(source: ImageData): OtsuResult {
  const { data, width, height } = source;
  const pixelCount = width * height;

  // Step 1 — collapse RGBA to a luminance histogram.
  // Using the Rec. 601 luma weights so colour photos of pencil sketches
  // (often slightly yellow / off-white paper) still produce a meaningful
  // greyscale signal.
  const histogram = new Uint32Array(LEVELS);
  const grays = new Uint8ClampedArray(pixelCount);
  for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
    const luma = (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000;
    const g = luma | 0; // truncate to integer 0..255
    grays[p] = g;
    histogram[g] += 1;
  }

  // Step 2 — total intensity sum (needed to compute class means cheaply).
  let totalIntensity = 0;
  for (let t = 0; t < LEVELS; t += 1) totalIntensity += t * histogram[t];

  // Step 3 — scan thresholds, tracking the running background weight and
  // intensity sum so each step is O(1).
  //
  //   Let w_b(t)  = sum_{i<=t} h_i        (background pixel count)
  //       w_f(t)  = N - w_b(t)            (foreground pixel count)
  //       mu_b(t) = sum_{i<=t} i*h_i / w_b(t)
  //       mu_f(t) = (totalIntensity - sum_{i<=t} i*h_i) / w_f(t)
  //
  //   Between-class variance:
  //       sigma_B^2(t) = w_b(t) * w_f(t) * (mu_b(t) - mu_f(t))^2
  //
  //   We maximise sigma_B^2 over t in [0, 254].
  let backgroundWeight = 0;
  let backgroundIntensity = 0;
  let bestThreshold = 0;
  let bestVariance = -1;
  for (let t = 0; t < LEVELS; t += 1) {
    backgroundWeight += histogram[t];
    if (backgroundWeight === 0) continue;
    const foregroundWeight = pixelCount - backgroundWeight;
    if (foregroundWeight === 0) break;
    backgroundIntensity += t * histogram[t];
    const meanBackground = backgroundIntensity / backgroundWeight;
    const meanForeground = (totalIntensity - backgroundIntensity) / foregroundWeight;
    const meanDiff = meanBackground - meanForeground;
    const betweenClassVariance = backgroundWeight * foregroundWeight * meanDiff * meanDiff;
    if (betweenClassVariance > bestVariance) {
      bestVariance = betweenClassVariance;
      bestThreshold = t;
    }
  }

  // Step 4 — apply the threshold. We write a NEW buffer so callers can
  // keep the original ImageData for side-by-side preview if they want.
  // Pixels at or below the threshold become foreground (ink = black), the
  // rest become background (paper = white). Alpha is preserved.
  const out = new Uint8ClampedArray(data.length);
  for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
    const isInk = grays[p] <= bestThreshold;
    const v = isInk ? 0 : 255;
    out[i] = v;
    out[i + 1] = v;
    out[i + 2] = v;
    out[i + 3] = data[i + 3];
  }

  return {
    imageData: new ImageData(out, width, height),
    threshold: bestThreshold
  };
}

/**
 * Convenience: take any HTMLCanvasElement, run Otsu on its current
 * contents, and write the binarised pixels back. Returns the chosen
 * threshold so the caller can surface it in the UI.
 */
export function otsuBinarizeCanvas(canvas: HTMLCanvasElement): number {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  const source = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { imageData, threshold } = otsuBinarize(source);
  ctx.putImageData(imageData, 0, 0);
  return threshold;
}
