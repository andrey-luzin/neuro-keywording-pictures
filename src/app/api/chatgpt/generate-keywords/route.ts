export async function POST(req: Request): Promise<Response> {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const fileName = file ? file.name : null;
  
    const responseBody = {
      fileName,
      keywords: 'keywords',
      description: 'description',
    }

    // TESTING ERROR HANDLING
    // if (fileName === 'Снимок экрана 2025-01-04 в 02.35.45.png') {
    //   throw new Error('Failed to generate keywords');
    // }
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
