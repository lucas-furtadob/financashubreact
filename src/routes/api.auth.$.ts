import { createFileRoute } from '@tanstack/react-router';
import { auth } from '#/lib/auth';

const handle = async ({ request }: { request: Request }) => {
  try {
    const response = await auth.handler(request);
    return response;
  } catch (err) {
    console.error("Auth Handler Error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: err instanceof Error ? err.message : String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
    },
  },
});
