import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        background:
          "linear-gradient(135deg, rgb(247, 246, 241) 0%, rgb(241, 242, 247) 100%)",
        color: "rgb(25, 25, 24)",
        padding: "56px",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: "Helvetica",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          maxWidth: "900px",
        }}
      >
        <div
          style={{
            fontSize: 24,
            textTransform: "uppercase",
            letterSpacing: "0.24em",
          }}
        >
          React package
        </div>
        <div
          style={{
            fontSize: 96,
            lineHeight: 0.95,
            fontWeight: 700,
            letterSpacing: "-0.06em",
          }}
        >
          GuideFrame
        </div>
        <div
          style={{
            fontSize: 36,
            lineHeight: 1.25,
            color: "rgba(25, 25, 24, 0.78)",
            maxWidth: "860px",
          }}
        >
          Add a browser-visible layout grid to React apps for spacing and
          alignment checks.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        {["overlay", "spacing", "alignment", "Next.js"].map((item) => (
          <div
            key={item}
            style={{
              display: "flex",
              border: "1px solid rgba(25, 25, 24, 0.16)",
              borderRadius: "999px",
              padding: "12px 20px",
              fontSize: 24,
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>,
    size,
  );
}
