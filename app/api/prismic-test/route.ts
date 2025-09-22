import { NextResponse } from "next/server";
import { createClient, repositoryName } from "@/prismicio";

export async function GET(request: Request) {
  const client = createClient();
  const url = new URL(request.url);
  const type = url.searchParams.get("type") ?? "page";

  if (!process.env.PRISMIC_REPOSITORY_NAME) {
    return NextResponse.json(
      {
        ok: false,
        repository: repositoryName,
        error:
          "PRISMIC_REPOSITORY_NAME is not configured. Update your .env.local file to continue.",
      },
      { status: 500 }
    );
  }

  try {
    const documents = await client.getAllByType(type);

    return NextResponse.json({
      ok: true,
      repository: repositoryName,
      type,
      total: documents.length,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error connecting to Prismic";

    return NextResponse.json(
      {
        ok: false,
        repository: repositoryName,
        type,
        error: message,
      },
      { status: 500 }
    );
  }
}
