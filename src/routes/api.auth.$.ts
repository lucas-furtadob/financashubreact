import { createFileRoute } from "@tanstack/react-router";

const handle = async ({ request }: { request: Request }) => {
	try {
		const { auth } = await import("#/lib/auth");
		const response = await auth.handler(request);
		return response;
	} catch (err) {
		console.error("DEBUG - Auth Handler Failure:", err);
		return new Response(
			JSON.stringify({
				error: "Auth Initialization Failed",
				message: err instanceof Error ? err.message : String(err),
				stack: err instanceof Error ? err.stack : "",
			}),
			{ status: 500, headers: { "Content-Type": "application/json" } },
		);
	}
};

export const Route = createFileRoute("/api/auth/$")({
	server: {
		handlers: {
			GET: handle,
			POST: handle,
		},
	},
});
