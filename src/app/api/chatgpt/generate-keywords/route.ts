import { ChatGptModels } from "@/types/chatGPT";
import AWS from "aws-sdk";
import OpenAI from 'openai';
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { getExifToolInstance } from "@/utils/exiftool";

const openai = new OpenAI({
  project: process.env['PROJECT_ID'],
  apiKey: process.env['OPENAI_API_KEY'],
});

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export async function POST(req: Request): Promise<Response> {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const model = formData.get('model') as string || ChatGptModels.GPT4o;
    const exiftool = getExifToolInstance();

    console.log('ChatGPT model: ', model);

    if (!file) {
      return new Response('Файл отсутствует', { status: 400 });
    }

    const fileName = file.name;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const tempFilePath = join(process.cwd(), fileName);
    await writeFile(tempFilePath, buffer);

    const metadata = await exiftool.read(tempFilePath);
    let description = '';

    try {
      if (metadata['Description']) {
        description = metadata['Description'].split(".")[0].trim();
      } else {
        throw new Error('Description not found');
      }
    } finally {
      console.log('description', description);
      await unlink(tempFilePath);
    }

    const textTemplate = process.env.GENERATE_KEYWORDS_PROMT || "";
    const promt = `
      You will be provided with data in JSON format containing a block with a description and a block with an image URL. 
      ${textTemplate}
      Return a response in JSON as string format with the type: {keywords, description}.
    `;

    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: `uploads/${fileName}`,
      Body: buffer,
      ContentType: file.type,
      ACL: "public-read",
      Expires: new Date(Date.now() + 60 * 60 * 1000),
    };

    const uploadResult = await s3.upload(uploadParams).promise();
    const fileUrl = uploadResult.Location;

    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: [
            {
              type: "text",
              text: promt
            }
          ]
        },
        {
          role: "user",
          content: JSON.stringify([
            {
              type: "text",
              text: description,
            },
            {
              type: "image_url",
              image_url: { url: fileUrl },
            },
          ]),
        },
      ],
      response_format: { type: "json_object" },
    });
 
    const responseText = response.choices[0]?.message?.content ?? '';
    const parsedResponse = JSON.parse(responseText);

    const responseBody = {
      fileName,
      keywords: parsedResponse.keywords,
      description: parsedResponse.description,
    };

    console.log('generate keywords, responseBody:', responseBody);

    const deleteParams = {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: `uploads/${fileName}`,
    };

    s3.deleteObject(deleteParams).promise().catch((err) => {
      console.error("Ошибка при удалении файла из S3:", err);
    });

    return new Response(JSON.stringify(responseBody), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof Error) {
      return new Response(`Error generating: ${error.message}`, { status: 500 });
    } else {
      return new Response('Unknown error occurred', { status: 500 });
    }
  }
};
