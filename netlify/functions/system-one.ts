import {
  APIError,
  TypeSafeClient,
  type SystemOneRequest,
} from "@typesafe-ai/sdk";

const missingApiKeyResponse = {
  error: "The API service is not configured.",
};

export default async (request: Request) => {
  if (request.method !== "POST") {
    return Response.json(
      { error: "Method not allowed." },
      { status: 405, headers: { Allow: "POST" } },
    );
  }

  const apiKey = process.env.SYSTEM_ONE_API_KEY;
  if (!apiKey) {
    return Response.json(missingApiKeyResponse, { status: 500 });
  }

  let payload: SystemOneRequest;
  try {
    payload = (await request.json()) as SystemOneRequest;
  } catch {
    return Response.json({ error: "Invalid JSON request body." }, { status: 400 });
  }

  try {
    const client = new TypeSafeClient({ apiKey });
    const response = await client.systemOne(payload);

    return Response.json(response);
  } catch (error) {
    if (error instanceof APIError) {
      return Response.json(error.body ?? { error: "API request failed." }, {
        status: error.status,
      });
    }

    return Response.json({ error: "API request failed." }, { status: 502 });
  }
};
