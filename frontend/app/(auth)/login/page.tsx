export const metadata = { title: 'Sign in • AlgoDatta' };
import SignInForm from './signin-client';
export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] grid place-items-center p-6">
      <SignInForm />
    </div>
  );
}
