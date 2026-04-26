import localFont from "next/font/local";

export const HelveticaNeue = localFont({
  src: [
    {
      path: "./helvetica-neue/HelveticaNeue-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./helvetica-neue/HelveticaNeue-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./helvetica-neue/HelveticaNeue-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-helvetica-neue",
});

export const fontSatoshi = localFont({
  src: [
    {
      path: "./satoshi/Satoshi-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./satoshi/Satoshi-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./satoshi/Satoshi-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-satoshi",
});
