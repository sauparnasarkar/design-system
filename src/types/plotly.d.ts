declare module 'plotly.js-dist-min' {
  const Plotly: {
    react: (el: HTMLElement, data: unknown[], layout?: Record<string, unknown>, config?: Record<string, unknown>) => Promise<unknown>;
    relayout: (el: HTMLElement, layoutUpdate: Record<string, unknown>) => Promise<unknown>;
    restyle: (el: HTMLElement, update: Record<string, unknown>, traceIndices?: number[]) => Promise<unknown>;
    purge: (el: HTMLElement) => void;
    Plots: { resize: (el: HTMLElement) => void };
  };
  export default Plotly;
}
