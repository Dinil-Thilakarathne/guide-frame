import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  const verticalGuides = [320, 760];
  const horizontalTicks = [
    "x-0",
    "x-1",
    "x-2",
    "x-3",
    "x-4",
    "x-5",
    "x-6",
    "x-7",
    "x-8",
    "x-9",
    "x-10",
    "x-11",
    "x-12",
  ];
  const verticalTicks = ["y-0", "y-1", "y-2", "y-3", "y-4", "y-5", "y-6"];
  const gridColumns = ["c-0", "c-1", "c-2", "c-3", "c-4", "c-5"];

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        background: "rgb(249, 249, 247)",
        color: "rgb(31, 32, 32)",
        padding: "72px",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: "Arial, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 32,
          background: "rgba(31, 32, 32, 0.04)",
          borderBottom: "1px solid rgba(31, 32, 32, 0.12)",
        }}
      >
        {horizontalTicks.map((tick, index) => (
          <div
            key={tick}
            style={{
              display: "flex",
              width: 100,
              height: index % 2 === 0 ? 18 : 10,
              borderLeft: "1px solid rgba(31, 32, 32, 0.2)",
            }}
          />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 32,
          bottom: 0,
          left: 0,
          width: 32,
          background: "rgba(31, 32, 32, 0.04)",
          borderRight: "1px solid rgba(31, 32, 32, 0.12)",
          flexDirection: "column",
        }}
      >
        {verticalTicks.map((tick, index) => (
          <div
            key={tick}
            style={{
              display: "flex",
              height: 100,
              width: index % 2 === 0 ? 18 : 10,
              borderTop: "1px solid rgba(31, 32, 32, 0.2)",
            }}
          />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          position: "absolute",
          inset: "32px 0 0 32px",
          padding: "0 72px",
          gap: 16,
          opacity: 0.7,
        }}
      >
        {gridColumns.map((column) => (
          <div
            key={column}
            style={{
              display: "flex",
              flex: 1,
              background: "rgba(70, 116, 255, 0.055)",
              borderLeft: "1px solid rgba(70, 116, 255, 0.1)",
              borderRight: "1px solid rgba(70, 116, 255, 0.1)",
            }}
          />
        ))}
      </div>

      {verticalGuides.map((left) => (
        <div
          key={left}
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            bottom: 0,
            left,
            width: 2,
            background: "rgb(0, 188, 212)",
          }}
        />
      ))}

      <div
        style={{
          display: "flex",
          position: "absolute",
          left: 0,
          right: 0,
          top: 430,
          height: 2,
          background: "rgb(0, 188, 212)",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 20,
          maxWidth: 940,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            textTransform: "uppercase",
            letterSpacing: "0.24em",
          }}
        >
          Design engineering tool
        </div>
        <div
          style={{
            display: "flex",
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
            display: "flex",
            fontSize: 36,
            lineHeight: 1.25,
            color: "rgba(31, 32, 32, 0.78)",
            maxWidth: 900,
          }}
        >
          Layout grids, rulers, and guides for your running app.
        </div>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        {["React", "Svelte", "Vue", "Vanilla JS"].map((item) => (
          <div
            key={item}
            style={{
              display: "flex",
              border: "1px solid rgba(31, 32, 32, 0.16)",
              borderRadius: 999,
              padding: "12px 20px",
              fontSize: 24,
              background: "rgba(249, 249, 247, 0.88)",
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
