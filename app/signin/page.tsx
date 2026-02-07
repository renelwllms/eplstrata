import SignInForm from "./SignInForm";

export default async function SignInPage({
  searchParams
}: {
  searchParams?: Promise<{ callbackUrl?: string }>;
}) {
  const resolvedParams = await searchParams;
  const callbackUrl = resolvedParams?.callbackUrl || "/app/dashboard";

  return <SignInForm callbackUrl={callbackUrl} />;
}
