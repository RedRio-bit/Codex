import Link from "next/link";

export default function Home() {
  return (
    <main className="container">
      <h1>Next.js + Prismic starter</h1>
      <p>
        The project is ready to connect to your Prismic repository. Configure the
        <code>.env.local</code> file with your repository name and access token,
        then start the development server with <code>npm run dev</code>.
      </p>
      <section>
        <h2>Prismic check</h2>
        <p>
          You can verify the SDK connection by visiting the
          {" "}
          <Link href="/api/prismic-test?type=page">/api/prismic-test</Link>
          {" "}
          endpoint once your environment variables are in place.
        </p>
      </section>
    </main>
  );
}
