/*
 * @Author: kasuie
 * @Date: 2025-05-17 21:05:08
 * @LastEditors: kasuie
 * @LastEditTime: 2025-05-17 21:05:09
 * @Description:
 */
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" opacity="0.5">
  <defs>
    <linearGradient id="g-image-shimmer">
      <stop stop-color="#ccc" offset="20%" />
      <stop stop-color="#eee" offset="50%" />
      <stop stop-color="#ccc" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#d3d3d3" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g-image-shimmer)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;
const toBase64 = (str: string) => window.btoa(str);

export function makeBlurDataURL(width: number, height: number) {
  return `data:image/svg+xml;base64,${toBase64(shimmer(width, height))}`;
}
