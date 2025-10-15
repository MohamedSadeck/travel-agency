import { ButtonComponent } from "@syncfusion/ej2-react-buttons"
import { Link, redirect, useSearchParams } from "react-router"
import { loginWithGoogle, storeUserData } from "~/appwrite/auth"
import { account } from "~/appwrite/client"
import { useEffect } from "react"

export async function clientLoader(){
  try {
    const user = await account.get();
    // If user is authenticated, they need to be stored in DB and redirected
    if(user.$id) {
      // Store user data in database if OAuth callback
      const url = new URL(window.location.href);
      if (url.searchParams.get('oauth') === 'success') {
        console.log('OAuth callback detected, storing user data...');
        try {
          await storeUserData();
          console.log('User data stored successfully');
        } catch (dbError: any) {
          // Log database errors but don't block the redirect
          // This might happen if user already exists or permissions issue
          console.error('Failed to store user data:', dbError.message || dbError);
        }
      }
      return redirect('/dashboard');
    }

  } catch (error:any) {
      // If user is not authenticated (401/unauthorized), that's expected on sign-in page
      // Only log errors that are NOT authentication-related
      if (error?.code !== 401 && error?.type !== 'general_unauthorized_scope') {
        console.error('Unexpected error:', error);
      }
  }
  return null;
}

const SignIn = () => {
  const [searchParams] = useSearchParams();
  const oauthStatus = searchParams.get('oauth');

  useEffect(() => {
    if (oauthStatus === 'failure') {
      console.error('OAuth authentication failed');
    }
  }, [oauthStatus]);

  return (
    <main className="auth" >
      <section className="size-full glassmorphism flex items-center px-6 justify-center">
        <div className="sign-in-card">
          <header className="header">
            <Link to='/'>
              <img
                src="/assets/icons/logo.svg"
                alt='logo'
                className="size-[30px]"
              />
            </Link>
          </header>
          <article>
            <h2 className="p-28-semibold text-dark-100 text-center">
              Start your travel journey
            </h2>
            <p className="p-18-regular text-center text-gray-100 !leading-7">
              Sign in with Google to manage destinations, itineraries, and user activity with ease.
            </p>
          </article>
          {oauthStatus === 'failure' && (
            <p className="text-red-500 text-center mb-4">
              Authentication failed. Please try again.
            </p>
          )}
          <ButtonComponent
            type="button"
            iconCss="e-search-icon"
            className="button-class !h11 !w-full"
            onClick={loginWithGoogle}
          >
            <img
              src="/assets/icons/google.svg"
              className="size-5"
              alt="google"
            />
            <span className="p-18-semibold text-white">
              Sign In with Google
            </span>
          </ButtonComponent>
        </div>

      </section>

    </main>
  )
}

export default SignIn
