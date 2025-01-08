import { getCurrentTime } from '@/utils';
import { unparse } from 'papaparse';

export async function POST(req: Request): Promise<Response> {
  try {
    const data = await req.json();
    const csv = unparse(data);

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="keywords_${getCurrentTime()}.csv"`,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return new Response(`Error generating CSV: ${error.message}`, { status: 500 });
    } else {
      return new Response('Unknown error occurred', { status: 500 });
    }
  }
}