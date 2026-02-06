import SignInForm from "./SignInForm";

export default function SignInPage({
  searchParams
}: {
  searchParams?: { callbackUrl?: string };
}) {
  const callbackUrl = searchParams?.callbackUrl || "/app/dashboard";

  return <SignInForm callbackUrl={callbackUrl} />;
}
