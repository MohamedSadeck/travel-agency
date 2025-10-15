import { redirect } from 'react-router';

// Simple redirect from root to dashboard
// OAuth callback is now handled in sign-in route
export async function clientLoader() {
  return redirect('/dashboard');
}

export default function Home() {
  return null;
}
