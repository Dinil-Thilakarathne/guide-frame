import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
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
        border: "1px solid rgba(31, 32, 32, 0.16)",
        fontFamily: "Arial, sans-serif",
        fontSize: 26,
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
          left: 20,
          width: 2,
          background: "rgb(0, 188, 212)",
        }}
      />
      GF
    </div>,
    size,
  );
}
