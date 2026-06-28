import { renderOgImage, OG_SIZE } from "@/components/ogRender";

export const runtime = "edge";
export const alt = "Cycle Partners — Pôle Invest";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage();
}
