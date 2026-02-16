import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Remmik";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PLAYFAIR_URL =
  "https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtY.ttf";
const INTER_URL =
  "https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiA.woff2";

export default async function OGImage() {
  const [playfairData, interData] = await Promise.all([
    fetch(PLAYFAIR_URL).then((res) => res.arrayBuffer()),
    fetch(INTER_URL).then((res) => res.arrayBuffer()),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0000FF",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontFamily: "Playfair Display",
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          Remmik
        </div>
        <div
          style={{
            fontSize: 32,
            fontFamily: "Inter",
            fontWeight: 400,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            opacity: 0.85,
            marginTop: 24,
          }}
        >
          CVR 39483882 &bull; +45 31 58 50 80
        </div>
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
        {
          name: "Inter",
          data: interData,
          weight: 400,
          style: "normal",
        },
      ],
    }
  );
}
