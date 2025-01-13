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
    const { fileName, keywords, description } = data;

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
              text: `From now on, pretend you are an art and photo expert with limitless knowledge about the microstock industry and search engines, highly capable of distilling specific words to describe photos and illustrations so they will be easy to find through search. I need to check and improve the keywords and description for stock images. I need your help. There are a list of keywords (${keywords}) and description (${description}). Your tasks are: - Check that the description complies with the following rules: - Be unique. - Be good for SEO. - Use 2-4 main keywords. - Be no more than 200 characters long. - Consist of 2 short sentences. - Have a detailed, descriptive tone similar If the description does not comply with the rules, then rewrite it. - Check for duplicate words in the list. Don’t indicate words with same base (like plant-based and plant), check only for exact duplicates. You can add words and move more important words to the top of the list that reflect the concept of important concepts or popular search queries. - Analyse topic and theme of content based on keywords and sort keywords by relevance (not alphabetically!). - Provide the list in a single line, separating words with commas. Provide only the corrected description and keywords in response`,
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
