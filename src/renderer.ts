let renderImpl: () => void = () => {};

export function setRenderAll(fn: () => void): void {
  renderImpl = fn;
}

export function renderAll(): void {
  renderImpl();
}
