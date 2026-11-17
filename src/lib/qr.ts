import QRCode from "qrcode";

export async function toQrSvgDataUri(value: string): Promise<string> {
  const svg = await QRCode.toString(value, {
    type: "svg",
    margin: 1,
    width: 280,
    color: {
      dark: "#121212",
      light: "#FFFFFF",
    },
  });
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
