"use client";

import { QRCodeSVG } from "qrcode.react";

export function CardQRCode({ url }: { url: string }) {
  return (
    <QRCodeSVG
      value={url}
      size={64}
      level="M"
      bgColor="#F7F7F5"
      fgColor="#1A3C2B"
    />
  );
}
