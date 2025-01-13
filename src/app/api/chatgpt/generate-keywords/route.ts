import AWS from "aws-sdk";
import OpenAI from 'openai';

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
    if (!file) {
      return new Response('Файл отсутствует', { status: 400 });
    }

    const fileName = file.name;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

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
      model: "gpt-4o",
      messages: [
        {
          "role": "developer",
          "content": [
            {
              "type": "text",
              "text": 'Return a response in JSON as string format with the type: {keywords, description}'
            }
          ]
        },
        {
          role: "user",
          content: JSON.stringify([
            {
              type: "text",
              text: "From now on, pretend you are an art and photo expert with limitless knowledge about the microstock industry and search engines, highly capable of distilling specific words to describe photos and illustrations so they will be easy to find through search. I will upload an image, you need to suggest 25-30 related keywords that will extend the potential search. These can include synonyms or words that describe the concept from different angles. Always analyze file names, and if there are keywords, consider them when selecting keywords and descriptions. Ensure the initial keyword is included in the list but NOT repeated. Provide all keywords in a single list, separated by commas, ordered by relevance and importance for potential searches. You need to use single words, use constructions of more than one word only if these are stable phrases and when written separately the meaning changes greatly. You also need to make a description of this image. Each description must: - Be unique. - Be good for SEO. - Use 2-4 main keywords. - Be no more than 200 characters long. - Consist of 2 short sentences. - Have a detailed, descriptive tone similar to the following examples: 1. close-up view of an intricately designed American saddle on a speckled horse. The leather saddle showcases exquisite craftsmanship with elaborate carvings and stitching, highlighting the artistry involved in saddle making. 2.   Rock formation with intricate patterns and textures. The rocks display a variety of colors and shapes, with smooth pebbles nestled between larger, angular stones. 3. Beautiful beach scene from above, showcasing the clear turquoise water and white sandy shore. Numerous people are seen swimming and enjoying the waves, while others walk along the shoreline, casting long shadows in the sunlight.",
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
