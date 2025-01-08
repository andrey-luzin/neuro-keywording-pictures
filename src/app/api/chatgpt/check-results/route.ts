export async function POST(req: Request): Promise<Response> {
  try {
    const formData = await req.formData();

    const fileName = formData.get('fileName') as File;
  
    const responseBody = {
      fileName,
      keywords: 'keywords',
      description: 'description',
    }

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
