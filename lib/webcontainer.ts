import { WebContainer } from "@webcontainer/api";

let container: WebContainer | null = null;

export async function getWebContainer() {
  if (!container) {
    container = await WebContainer.boot();
  }
  return container;
}
