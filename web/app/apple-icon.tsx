import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        background: "rgb(249, 249, 247)",
        color: "rgb(31, 32, 32)",
        border: "2px solid rgba(31, 32, 32, 0.16)",
        borderRadius: 36,
        fontFamily: "Arial, sans-serif",
        fontSize: 72,
        fontWeight: 700,
        letterSpacing: "-0.08em",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 56,
          width: 4,
          background: "rgb(0, 188, 212)",
        }}
      />
      GF
    </div>,
    size,
  );
}
