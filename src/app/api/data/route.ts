import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "src/data.json");

// Ensure the file exists, if not create it with default data
if (!fs.existsSync(dataFilePath)) {
  const defaultData = {
    logo: "/uploads/logo.png",
    mainButtons: [
      { id: "telegram", label: "Telegram", url: "#", bgClass: "bg-telegram" },
      { id: "line", label: "LINE", url: "#", bgClass: "bg-line" },
      {
        id: "messenger",
        label: "Messenger",
        url: "#",
        bgClass: "bg-messenger",
      },
      { id: "viber", label: "Viber", url: "#", bgClass: "bg-viber" },
    ],
    socials: [
      { id: "facebook", url: "#", active: true },
      { id: "youtube", url: "#", active: true },
      { id: "tiktok", url: "#", active: true },
      { id: "telegram", url: "#", active: true },
    ],
  };
  fs.writeFileSync(dataFilePath, JSON.stringify(defaultData, null, 2));
}

export async function GET() {
  const fileContent = fs.readFileSync(dataFilePath, "utf8");
  const data = JSON.parse(fileContent);
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const data = await request.json();
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
  return NextResponse.json({ success: true, data });
}
