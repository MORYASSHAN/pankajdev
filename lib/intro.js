// Resolves once the loader has finished, so sections can play their entrance.
let resolveIntro;
export const introDone = typeof window !== "undefined" ? new Promise((r) => (resolveIntro = r)) : Promise.resolve();
export const finishIntro = () => resolveIntro && resolveIntro();
