import { exiftool } from "exiftool-vendored";
import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import { getCurrentTime } from '@/utils';

export async function POST(req: Request): Promise<Response> {
  try {
    const { files } = await req.json();

    if (!files || !Array.isArray(files)) {
      throw new Error("No files provided or invalid format");
    }

    const tempDir = path.join(process.cwd(), "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const zip = new AdmZip();

    for (const file of files) {
      const { fileName, keywords, description, file: base64File } = file;

      if (!fileName || !base64File) {
        throw new Error("Invalid file format. Each file must have 'fileName' and 'file'.");
      }

      const tempFilePath = path.join(tempDir, fileName);

      fs.writeFileSync(tempFilePath, Buffer.from(base64File, "base64"));

      console.log('keywords', keywords);
      console.log('description', description);
      
      const exifData: Record<string, string> = {};
      exifData.Author = process.env.AUTHOR_NAME || '';
      exifData.Creator = process.env.AUTHOR_NAME || '';
      exifData.Artist = process.env.AUTHOR_NAME || '';
      exifData['By-line'] = process.env.AUTHOR_NAME || '';

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

      console.log('exifData', exifData);

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
      return new Response(`Error generating: ${error.message}`, { status: 500 });
    } else {
      return new Response("Unknown error occurred", { status: 500 });
    }
  }
}