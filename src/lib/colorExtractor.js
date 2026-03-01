/**
 * Extract dominant colors from an image using canvas sampling
 * No external dependency needed - pure canvas API
 */
export function extractColors(imageElement, numColors = 8) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const size = 150; // Sample at reduced size for speed
  canvas.width = size;
  canvas.height = size;
  ctx.drawImage(imageElement, 0, 0, size, size);

  const imageData = ctx.getImageData(0, 0, size, size).data;
  const pixels = [];

  for (let i = 0; i < imageData.length; i += 16) { // Sample every 4th pixel
    const r = imageData[i], g = imageData[i + 1], b = imageData[i + 2], a = imageData[i + 3];
    if (a < 128) continue; // Skip transparent
    if (r > 245 && g > 245 && b > 245) continue; // Skip near-white
    if (r < 10 && g < 10 && b < 10) continue; // Skip near-black
    pixels.push([r, g, b]);
  }

  // Simple k-means clustering
  return kMeans(pixels, numColors).map(c => ({
    hex: rgbToHex(c[0], c[1], c[2]),
    rgb: { r: c[0], g: c[1], b: c[2] },
    hsl: rgbToHsl(c[0], c[1], c[2])
  }));
}

function kMeans(pixels, k, iterations = 10) {
  if (pixels.length === 0) return Array(k).fill([128, 128, 128]);
  // Random initialization for better color diversity
  const indices = new Set();
  while (indices.size < Math.min(k, pixels.length)) {
    indices.add(Math.floor(Math.random() * pixels.length));
  }
  let centroids = [...indices].map(i => [...pixels[i]]);
  while (centroids.length < k) centroids.push([...centroids[0]]);

  for (let iter = 0; iter < iterations; iter++) {
    const clusters = Array.from({ length: k }, () => []);
    for (const pixel of pixels) {
      let minDist = Infinity, closest = 0;
      for (let i = 0; i < k; i++) {
        const d = Math.hypot(pixel[0] - centroids[i][0], pixel[1] - centroids[i][1], pixel[2] - centroids[i][2]);
        if (d < minDist) { minDist = d; closest = i; }
      }
      clusters[closest].push(pixel);
    }
    for (let i = 0; i < k; i++) {
      if (clusters[i].length === 0) continue;
      centroids[i] = clusters[i].reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]], [0, 0, 0])
        .map(v => Math.round(v / clusters[i].length));
    }
  }
  return centroids;
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/**
 * Analyze a color palette for PBI design patterns
 */
export function analyzePalette(colors) {
  if (!colors.length) return { type: 'empty', suggestion: 'Add screenshots to extract colors' };

  const avgLightness = colors.reduce((s, c) => s + c.hsl.l, 0) / colors.length;
  const hues = colors.map(c => c.hsl.h);
  const hueRange = Math.max(...hues) - Math.min(...hues);

  return {
    isDark: avgLightness < 40,
    isLight: avgLightness > 60,
    isMonochromatic: hueRange < 30,
    isComplementary: hueRange > 150,
    avgLightness: Math.round(avgLightness),
    dominantHue: hues[0],
    suggestion: avgLightness < 40
      ? 'Dark theme detected — great for executive dashboards'
      : avgLightness > 60
        ? 'Light theme — clean and professional'
        : 'Balanced palette — versatile for any dashboard'
  };
}
