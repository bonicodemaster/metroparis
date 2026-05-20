/**
 * Projection lat/lon → coordonnées SVG pour la carte du métro parisien.
 *
 * Approche : projection linéaire dans un rectangle qui englobe les stations
 * extrêmes du réseau (Asnières/La Courneuve au N, Pointe du Lac au S, etc.).
 * Suffisamment précise à l'échelle de Paris (déformation < 1km).
 */

export interface ViewBox {
  width: number;
  height: number;
}

export interface GeoBounds {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

/** Bornes calibrées sur le réseau (avec ~3% de marge tout autour). */
export const PARIS_BOUNDS: GeoBounds = {
  minLat: 48.770,
  maxLat: 48.948,
  minLon: 2.220,
  maxLon: 2.470,
};

export const SVG_VIEWBOX: ViewBox = { width: 1200, height: 900 };

/**
 * Projette des coordonnées géographiques en coordonnées SVG.
 * Préserve les ratios pour éviter l'étirement.
 */
export function project(
  lat: number,
  lon: number,
  bounds: GeoBounds = PARIS_BOUNDS,
  vb: ViewBox = SVG_VIEWBOX
): { x: number; y: number } {
  const lonRange = bounds.maxLon - bounds.minLon;
  const latRange = bounds.maxLat - bounds.minLat;

  // Correction longitude pour la latitude moyenne de Paris (~48.86°)
  const lonScale = Math.cos((48.86 * Math.PI) / 180);
  const effectiveLonRange = lonRange * lonScale;

  const aspect = vb.width / vb.height;
  const geoAspect = effectiveLonRange / latRange;

  let scaleX: number;
  let scaleY: number;
  let offsetX = 0;
  let offsetY = 0;

  if (geoAspect > aspect) {
    // limited by width
    scaleX = vb.width / effectiveLonRange;
    scaleY = scaleX;
    offsetY = (vb.height - latRange * scaleY) / 2;
  } else {
    scaleY = vb.height / latRange;
    scaleX = scaleY;
    offsetX = (vb.width - effectiveLonRange * scaleX) / 2;
  }

  const x = offsetX + (lon - bounds.minLon) * lonScale * scaleX;
  const y = offsetY + (bounds.maxLat - lat) * scaleY;

  return { x, y };
}

/** Distance euclidienne en pixels SVG (utilisée pour tolérance des clics). */
export function distancePx(
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
