import type { Route } from "next";
import Link from "next/link";

export default async function NotFound() {
  "use cache";
  return (
    <div className="relative min-h-[calc(100vh-65px)] w-full bg-white dark:bg-zinc-900 flex items-center justify-center p-6">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950"></div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
        {/* 404 Section */}
        <div className="space-y-6">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Architecture Graph
            </span>
          </div>

          <h1 className="text-[100px] md:text-[140px] font-bold text-zinc-900 dark:text-zinc-100 leading-none tracking-tighter">
            404
          </h1>

          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
              Page Not Found
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 w-full sm:w-auto justify-center"
          >
            <svg
              className="w-4 h-4 transition-transform group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Back to Home
          </Link>

          <Link
            href={"/diagram/git/merging/squash" as Route}
            className="group inline-flex items-center gap-2 px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors duration-200 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 w-full sm:w-auto justify-center"
          >
            View Diagrams
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
        </div>

        {/* Help links */}
        <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Need help?{" "}
            <Link
              href={"/diagram/git/merging/squash" as Route}
              className="text-zinc-900 dark:text-zinc-100 hover:underline font-medium transition-colors"
            >
              Browse diagrams
            </Link>{" "}
            or{" "}
            <Link
              href="/"
              className="text-zinc-900 dark:text-zinc-100 hover:underline font-medium transition-colors"
            >
              go home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
