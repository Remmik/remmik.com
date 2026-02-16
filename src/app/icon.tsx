import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const PLAYFAIR_URL =
  "https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtY.ttf";

export default async function Icon() {
  const playfairData = await fetch(PLAYFAIR_URL).then((res) =>
    res.arrayBuffer()
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0000FF",
          borderRadius: 6,
          color: "#ffffff",
          fontSize: 22,
          fontFamily: "Playfair Display",
          fontWeight: 700,
        }}
      >
        R
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Playfair Display",
          data: playfairData,
          weight: 700,
          style: "normal",
        },
      ],
    }
  );
}
