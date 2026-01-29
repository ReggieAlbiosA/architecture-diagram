import type { Metadata } from "next";
import { SessionCookieFlow } from "./session-cookie-flow";

export const metadata: Metadata = {
  title: "Session-Cookie Authentication Flow | Architecture Graph",
  description:
    "Interactive visualization of stateful session-cookie authentication. Understand how servers store session data and browsers hold session IDs in cookies.",
};

export default function SessionCookiePage() {
  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Session-Cookie Authentication Flow
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            An animated visualization of stateful authentication. Data stays on
            the server; the browser holds a reference (Session ID).
          </p>
        </header>

        {/* Interactive Visualization */}
        <SessionCookieFlow />

        {/* Additional Context */}
        <section className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Key Concepts
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="font-semibold text-slate-900 dark:text-white">
                  Session ID
                </dt>
                <dd className="text-slate-600 dark:text-slate-400 mt-1">
                  A unique, random string (e.g., &quot;sess_123&quot;) generated
                  by the server. It acts as a key to lookup user data stored on
                  the server.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900 dark:text-white">
                  Session Store
                </dt>
                <dd className="text-slate-600 dark:text-slate-400 mt-1">
                  Server-side storage (Redis, database, or in-memory) that maps
                  Session IDs to user data. Only the server can access this
                  data.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900 dark:text-white">
                  HttpOnly Cookie
                </dt>
                <dd className="text-slate-600 dark:text-slate-400 mt-1">
                  A browser cookie with the HttpOnly flag prevents JavaScript
                  access, reducing XSS attack risk. The Secure flag ensures it
                  only travels over HTTPS.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900 dark:text-white">
                  Stateful Authentication
                </dt>
                <dd className="text-slate-600 dark:text-slate-400 mt-1">
                  The server maintains session state. Each request validates the
                  session ID against the session store to authenticate the user.
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </div>
  );
}
