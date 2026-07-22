/**
 * builder-preview.ts
 * Module-level singleton — builder admin panelinden iframe'e gönderilen
 * postMessage verilerini component ağacının her yerine iletmek için.
 */

type Listener = () => void;
const listeners = new Set<Listener>();
let _preview: any = null;
let _previewHeroSlides: any[] | null = null;

export function getBuilderPreview(): any {
  return _preview;
}

export function getBuilderHeroSlides(): any[] | null {
  return _previewHeroSlides;
}

export function setBuilderPreview(settings: any, heroSlides?: any[]): void {
  _preview = settings;
  if (heroSlides) {
    _previewHeroSlides = heroSlides;
  }
  listeners.forEach((fn) => fn());
}

export function subscribeBuilderPreview(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

