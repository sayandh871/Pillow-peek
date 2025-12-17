import Link from "next/link";
import SocialProviders from "./SocialProviders";

type Mode = "sign-in" | "sign-up";

const copy = {
  "sign-in": {
    title: "Welcome back",
    subtitle: "Sign in to continue your journey.",
    cta: "Sign In",
    alt: "Don’t have an account?",
    altLink: { href: "/sign-up", label: "Sign up" },
    footnote: "By signing in, you agree to our Terms of Service and Privacy Policy.",
  },
  "sign-up": {
    title: "Join Pillow Peek today!",
    subtitle: "Create your account to start your comfort journey.",
    cta: "Sign Up",
    alt: "Already have an account?",
    altLink: { href: "/sign-in", label: "Sign in" },
    footnote: "By signing up, you agree to our Terms of Service and Privacy Policy.",
  },
} as const;

export default function AuthForm({ mode }: { mode: Mode }) {
  const content = copy[mode];
  const showConfirm = mode === "sign-up";
  const showFullName = mode === "sign-up";

  return (
    <div className="w-full max-w-md rounded-2xl bg-light-100 p-6 shadow-sm ring-1 ring-light-300 sm:p-8">
      <div className="flex items-center justify-between text-caption text-dark-700">
        <span>{mode === "sign-in" ? "New here?" : "Already have an account?"}</span>
        <Link href={content.altLink.href} className="font-medium text-dark-900 underline">
          {content.altLink.label}
        </Link>
      </div>

      <div className="mt-6 space-y-2 text-center">
        <h1 className="text-heading-2 text-dark-900">{content.title}</h1>
        <p className="text-body text-dark-700">{content.subtitle}</p>
      </div>

      <div className="mt-8 space-y-3">
        <SocialProviders />
        <div className="flex items-center gap-3 text-caption text-dark-700">
          <span className="h-px flex-1 bg-light-300" />
          <span>{mode === "sign-in" ? "Or sign in with" : "Or sign up with"}</span>
          <span className="h-px flex-1 bg-light-300" />
        </div>
      </div>

      <form className="mt-6 space-y-4">
        {showFullName && (
          <div className="space-y-2">
            <label className="text-caption text-dark-900" htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              className="w-full rounded-lg border border-light-300 bg-light-100 px-3 py-2.5 text-body text-dark-900 outline-none ring-offset-2 focus:border-dark-900 focus:ring-2 focus:ring-dark-900/20"
              placeholder="Enter your full name"
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-caption text-dark-900" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-light-300 bg-light-100 px-3 py-2.5 text-body text-dark-900 outline-none ring-offset-2 focus:border-dark-900 focus:ring-2 focus:ring-dark-900/20"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-caption text-dark-900" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-lg border border-light-300 bg-light-100 px-3 py-2.5 pr-10 text-body text-dark-900 outline-none ring-offset-2 focus:border-dark-900 focus:ring-2 focus:ring-dark-900/20"
              placeholder="minimum 8 characters"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-dark-700/70">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M12 5c-5 0-9 4-9 7s4 7 9 7 9-4 9-7-4-7-9-7Zm0 2c3.08 0 5.64 2.4 6.6 4-.96 1.6-3.52 4-6.6 4s-5.64-2.4-6.6-4c.96-1.6 3.52-4 6.6-4Zm0 1.5A3.5 3.5 0 0 0 8.5 12 3.5 3.5 0 0 0 12 15.5 3.5 3.5 0 0 0 15.5 12 3.5 3.5 0 0 0 12 8.5Zm0 2A1.5 1.5 0 0 1 13.5 12 1.5 1.5 0 0 1 12 13.5 1.5 1.5 0 0 1 10.5 12 1.5 1.5 0 0 1 12 10.5Z"
                />
              </svg>
            </span>
          </div>
        </div>

        {showConfirm && (
          <div className="space-y-2">
            <label className="text-caption text-dark-900" htmlFor="confirmPassword">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="w-full rounded-lg border border-light-300 bg-light-100 px-3 py-2.5 text-body text-dark-900 outline-none ring-offset-2 focus:border-dark-900 focus:ring-2 focus:ring-dark-900/20"
              placeholder="Re-enter your password"
            />
          </div>
        )}

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-full bg-dark-900 px-4 py-3 text-body-medium font-medium text-light-100 transition-colors hover:bg-dark-700"
        >
          {content.cta}
        </button>
      </form>

      <p className="mt-6 text-center text-footnote text-dark-700">{content.footnote}</p>
    </div>
  );
}


