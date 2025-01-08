// Update EXIF data and archive the file
import { exiftool } from "exiftool-vendored";
import archiver from "archiver";
import fs from "fs";
import path from "path";

export async function POST(req: Request): Promise<Response> {
  try {
    // Получаем данные запроса
    const { files } = await req.json();

    if (!files || !Array.isArray(files)) {
      throw new Error("No files provided or invalid format");
    }

    // Временная директория для обработки файлов
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const archivePath = path.join(tempDir, 'result.zip');
    const output = fs.createWriteStream(archivePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    // Обработка ошибок архива
    archive.on('error', (err) => {
      throw err;
    });

    // Привязка архива к потоку
    archive.pipe(output);

    for (const file of files) {
      const { fileName, keywords, description, file: base64File } = file;

      if (!fileName || !base64File) {
        throw new Error("Invalid file format. Each file must have 'fileName' and 'file'.");
      }

      // Сохраняем файл во временной папке
      const tempFilePath = path.join(tempDir, fileName);
      fs.writeFileSync(tempFilePath, Buffer.from(base64File, "base64"));

      // Подготавливаем Exif-данные
      const exifData: Record<string, string> = {};
      if (keywords) {
        exifData.Keywords = keywords;
      }
      if (description) {
        exifData.Headline = description;
        exifData.Description = description;
        exifData.Title = description;
      }

      // Изменяем Exif-данные
      await exiftool.write(tempFilePath, exifData);

      // Добавляем файл в архив
      archive.file(tempFilePath, { name: fileName });
    }

    // Завершаем архив
    await archive.finalize();

    // Чтение архива и отправка в ответе
    const zipData = fs.readFileSync(archivePath);

    // Удаляем временные файлы
    fs.rmSync(tempDir, { recursive: true, force: true });

    return new Response(zipData, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="result.zip"',
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