import { getAssetFromKV } from "@cloudflare/kv-asset-handler";

interface KVNamespace {
  get(key: string, options?: any): Promise<any>;
  put(key: string, value: any, options?: any): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface Env {
  __STATIC_CONTENT: KVNamespace;
  ZENOBIA_CLIENT_ID?: string;
  ZENOBIA_CLIENT_SECRET?: string;
}

// Helper function to add CORS headers to a response
function addCorsHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  headers.set("Access-Control-Max-Age", "86400"); // 24 hours

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// Function to get an access token from Auth0
async function getAccessToken(env: Env): Promise<string> {
  try {
    const tokenUrl = "https://dev-iols5y7cp32hlyr1.us.auth0.com/oauth/token";
    const clientId = env.ZENOBIA_CLIENT_ID || "";
    const clientSecret = env.ZENOBIA_CLIENT_SECRET || "";
    console.log("clientId", clientId);
    console.log("clientSecret", clientSecret);
    const audience = "https://dashboard.zenobiapay.com";

    // If using development/test mode and no credentials are provided
    if (!clientId || !clientSecret) {
      console.warn("No Auth0 credentials provided, using test mode");
      return "test_token";
    }

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        audience: audience,
        grant_type: "client_credentials",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to get access token: ${response.status} ${errorText}`
      );
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error getting access token:", error);
    throw new Error("Failed to authenticate with Auth0");
  }
}

async function handleCreateTransfer(
  request: Request,
  env: Env
): Promise<Response> {
  // Handle CORS preflight requests
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204, // No content
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400", // 24 hours
      },
    });
  }

  // Check if it's a POST request
  if (request.method !== "POST") {
    const errorResponse = new Response("Method not allowed", { status: 405 });
    return addCorsHeaders(errorResponse);
  }

  try {
    // Get the request body
    const body = await request.json();

    // Validate required fields
    if (!body.amount || !Array.isArray(body.statementItems)) {
      const errorResponse = new Response(
        "Invalid request: missing required fields",
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
      return addCorsHeaders(errorResponse);
    }

    // Forward the request to the Zenobia Pay API
    try {
      // Get access token from Auth0
      const accessToken = await getAccessToken(env);

      const fetchBody = {
        amount: body.amount,
        statementItems: body.statementItems,
      };

      console.log("Making API request with:", {
        url: "https://api.zenobiapay.com/create-transfer-request",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: fetchBody,
      });

      const apiResponse = await fetch(
        "https://api.zenobiapay.com/create-transfer-request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(fetchBody),
        }
      );

      // Check if the response is ok
      if (!apiResponse.ok) {
        // Try to extract error message from response if it's JSON
        let errorMessage = `API returned status ${apiResponse.status}`;
        const contentType = apiResponse.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await apiResponse.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            // If parsing fails, use the default error message
          }
        }

        throw new Error(errorMessage);
      }

      // Try to parse the JSON response
      let data;
      const contentType = apiResponse.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await apiResponse.json();
      } else {
        throw new Error("API did not return a JSON response");
      }

      // Return the response to the client with CORS headers
      const response = new Response(JSON.stringify(data), {
        status: apiResponse.status,
        headers: { "Content-Type": "application/json" },
      });
      return addCorsHeaders(response);
    } catch (apiError) {
      console.error("API request failed:", apiError);
      const errorResponse = new Response(
        JSON.stringify({ error: apiError.message || "API request failed" }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        }
      );
      return addCorsHeaders(errorResponse);
    }
  } catch (error) {
    console.error("Error processing transfer request:", error);
    const errorResponse = new Response(
      JSON.stringify({ error: "Failed to process payment" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
    return addCorsHeaders(errorResponse);
  }
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: { waitUntil(promise: Promise<any>): void }
  ): Promise<Response> {
    try {
      const url = new URL(request.url);

      // Handle the create-transfer endpoint
      if (url.pathname === "/create-transfer") {
        return handleCreateTransfer(request, env);
      }

      // Get the asset from KV
      const response = await getAssetFromKV({
        request,
        waitUntil: ctx.waitUntil.bind(ctx),
      });

      // If the URL doesn't have a file extension, serve the index.html (SPA fallback)
      if (!url.pathname.includes(".")) {
        const indexResponse = await getAssetFromKV({
          request: new Request(`${url.origin}/index.html`, request),
          waitUntil: ctx.waitUntil.bind(ctx),
        });
        return indexResponse;
      }

      return response;
    } catch (e) {
      return new Response("Not Found", { status: 404 });
    }
  },
};
