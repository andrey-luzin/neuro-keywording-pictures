import { ExifTool } from "exiftool-vendored";

let exiftool: ExifTool | null = null;

export function getExifToolInstance() {
  if (!exiftool) {
    exiftool = new ExifTool();
    console.log("ExifTool: start");
    
    process.on("exit", () => {
      exiftool?.end();
      console.log("ExifTool: exit");
    });

    process.on("SIGINT", () => {
      exiftool?.end();
      console.log("ExifTool: SIGINT");
      process.exit();
    });
  }
  return exiftool;
}