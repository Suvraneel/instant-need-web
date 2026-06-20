import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 7,
          backgroundColor: "#2563eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 64 64" fill="none">
          <path d="M35 10L19 37L30 37L24 54L40 27L30 27Z" fill="white" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
