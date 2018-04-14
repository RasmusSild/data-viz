export enum Mode {
  Eigenvector,
  Closeness,
  Betweenness,
  Degree
}

export function getViewportDimensions() {
  let e: any = window;
  let a = 'inner';
  if (!('innerWidth' in window)) {
    a = 'client';
    e = document.documentElement || document.body;
  }
  return { width : e[ a + 'Width' ] , height : e[ a + 'Height' ] };
}
