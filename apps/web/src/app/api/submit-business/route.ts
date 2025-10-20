import { submitBusinessFormSchema } from '@/lib/schema'

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const parsed = submitBusinessFormSchema.parse(data);
    return Response.json({
      message: 'Business submitted successfully',
      data: parsed,
      status: 'success'
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'Invalid request', error: String(error), status: 'error' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

