import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import { getCurrentTime } from '@/utils';
import { getExifToolInstance } from "@/utils/exiftool";

export async function POST(req: Request): Promise<Response> {
  try {
    const formData = await req.formData();

    const files = formData.getAll('files') as File[];
    const fileNames = formData.getAll('fileNames') as string[];
    const keywordsList = formData.getAll('keywords') as string[];
    const descriptionsList = formData.getAll('descriptions') as string[];

    if (!files.length) {
      throw new Error("No files uploaded");
    }

    const tempDir = path.join(process.cwd(), "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const exiftool = getExifToolInstance();
    const zip = new AdmZip();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = fileNames[i];
      const keywords = keywordsList[i];
      const description = descriptionsList[i];

      if (!file || !fileName) {
        throw new Error(`Missing file or fileName for one of the uploads`);
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const tempFilePath = path.join(tempDir, fileName);

      fs.writeFileSync(tempFilePath, buffer);

      const exifData: Record<string, string> = {};
      const author = process.env.AUTHOR_NAME || '';

      exifData.Author = author;
      exifData.Creator = author;
      exifData.Artist = author;
      exifData['By-line'] = author;

      if (keywords) {
        exifData.Keywords = keywords;
      }
      if (description) {
        exifData.Headline = description;
        exifData.Description = description;
        exifData.ImageDescription = description;
        exifData['Caption-Abstract'] = description;
        exifData.Title = description;
      }

      await exiftool.write(tempFilePath, exifData);

      zip.addLocalFile(tempFilePath);
    }

    const archiveBuffer = zip.toBuffer();

    fs.rmSync(tempDir, { recursive: true, force: true });

    return new Response(archiveBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename=updated-images_${getCurrentTime()}.zip`,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return new Response(`Error generating archive: ${error.message}`, { status: 500 });
    } else {
      return new Response("Unknown error occurred", { status: 500 });
    }
  }
}