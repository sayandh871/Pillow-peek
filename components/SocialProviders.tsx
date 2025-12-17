const providers = [
  {
    name: "Continue with Google",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          fill="#EA4335"
          d="M24 9.5c3.3 0 5.5 1.4 6.8 2.6l5-4.9C32.9 3.1 28.8 1.5 24 1.5 14.9 1.5 7.2 6.9 4 14.3l5.9 4.6C11.6 13.5 17.3 9.5 24 9.5z"
        />
        <path
          fill="#4285F4"
          d="M46.5 24.5c0-1.6-.1-2.7-.4-3.9H24v7.1h12.9c-.3 1.8-1.6 4.4-4.6 6.2l7.1 5.5c4.2-3.9 7.1-9.5 7.1-14.9z"
        />
        <path
          fill="#FBBC05"
          d="M9.9 28.9c-.5-1.3-.8-2.6-.8-4 0-1.4.3-2.7.8-4L4 14.3C2.7 17 2 20.1 2 23.4c0 3.3.7 6.4 2 9.1l5.9-3.6z"
        />
        <path
          fill="#34A853"
          d="M24 46.5c5.9 0 10.8-1.9 14.4-5.1l-7.1-5.5c-1.9 1.3-4.6 2.2-7.3 2.2-6.7 0-12.4-4-14.5-9.7L4 32.5c3.2 7.4 10.9 14 20 14z"
        />
        <path fill="none" d="M2 2h44v44H2z" />
      </svg>
    ),
  },
  {
    name: "Continue with Apple",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M16.5 2c-.8.1-1.8.6-2.4 1.2-.5.5-.9 1.3-.8 2 .9.1 1.8-.4 2.4-1.1.6-.7 1-1.6.8-2.1Zm4.1 16.5c-.6 1.5-2.6 4.1-4.1 4.1-1.1 0-1.3-.7-3-.7-1.7 0-2 .7-3 .7-1.5.1-3.7-2.3-4.3-3.8-1.2-2.6-.9-6.2 1-8 .7-.7 1.7-1.2 2.6-1.2 1.2 0 2 .8 3 .8 1 0 1.6-.8 3-.8 1 0 2 .4 2.7 1.2-.1.1-2.3 1.4-2.2 4 0 3.2 2.8 4.2 2.8 4.2Z"
        />
      </svg>
    ),
  },
];

export default function SocialProviders() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {providers.map((provider) => (
        <button
          key={provider.name}
          type="button"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-light-300 bg-light-100 px-4 py-2.5 text-body-medium font-medium text-dark-900 transition-colors hover:border-dark-500"
        >
          {provider.icon}
          <span>{provider.name}</span>
        </button>
      ))}
    </div>
  );
}


