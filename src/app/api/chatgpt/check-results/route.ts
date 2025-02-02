import OpenAI from 'openai';

const openai = new OpenAI({
  project: process.env['PROJECT_ID'],
  apiKey: process.env['OPENAI_API_KEY'],
});

export async function POST(req: Request): Promise<Response> {
  try {
    const data = await req.json();

    if (!data) {
      return new Response('Нет данных для проверки', { status: 400 });
    }
    console.log('check-results data', data);
    const { fileName, keywords, description, model } = data;

    const textTemplate = process.env.CHECK_RESULTS_PROMT || "";

    const promt = textTemplate
      .replace("${keywords}", keywords)
      .replace("${description}", description);

    const response = await openai.chat.completions.create({
      model,
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
              text: promt,
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
    }

    console.log('check results, responseBody:', responseBody);

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
