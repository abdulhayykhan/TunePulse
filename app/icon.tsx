import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 3,
          paddingBottom: 4,
        }}
      >
        <div style={{ width: 6, height: 10, background: "#1DB954", opacity: 0.55, borderRadius: 2 }} />
        <div style={{ width: 6, height: 16, background: "#1DB954", opacity: 0.8, borderRadius: 2 }} />
        <div style={{ width: 6, height: 22, background: "#1DB954", borderRadius: 2 }} />
      </div>
    ),
    { ...size },
  );
}