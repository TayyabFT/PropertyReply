import AuthScreen from "@/components/auth/AuthScreen";

export default function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  return <AuthScreen mode="login" nextPath={searchParams.next} />;
}
