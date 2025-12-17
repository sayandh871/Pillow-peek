import AuthForm from "@/components/AuthForm";

export default function SignInPage() {
  return (
    <div className="w-full max-w-xl space-y-6">
      <p className="text-caption font-medium text-dark-700">Sign in</p>
      <AuthForm mode="sign-in" />
    </div>
  );
}


