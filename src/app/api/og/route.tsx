import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "Blog";

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1a1a2e",
        color: "#eaeaea",
        fontSize: 48,
        fontWeight: 700,
      }}
    >
      <div style={{ marginBottom: 24 }}>📝</div>
      <div style={{ maxWidth: "80%", textAlign: "center" }}>{title}</div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}
