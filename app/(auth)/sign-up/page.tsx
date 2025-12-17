import AuthForm from "@/components/AuthForm";

export default function SignUpPage() {
  return (
    <div className="w-full max-w-xl space-y-6">
      <p className="text-caption font-medium text-dark-700">Create account</p>
      <AuthForm mode="sign-up" />
    </div>
  );
}


