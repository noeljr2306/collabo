// lib/webcontainer.ts
// WebContainer is a singleton — only one instance can exist per page.
// This module ensures boot() is only ever called once, even in React StrictMode.

let instance: any = null;
let bootPromise: Promise<any> | null = null;

export async function getWebContainer(): Promise<any> {
  // Already booted
  if (instance) return instance;

  // Already booting — return the same promise
  if (bootPromise) return bootPromise;

  bootPromise = (async () => {
    const { WebContainer } = await import("@webcontainer/api");
    instance = await WebContainer.boot();
    return instance;
  })();

  return bootPromise;
}