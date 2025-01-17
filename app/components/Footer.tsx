import Link from 'next/link';
import Image from 'next/image';
import { ServerStatus } from './ServerStatus';

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">TrackRights.com</h3>
            <p className="text-sm text-purple-200">
              Empowering music producers with AI-powered contract analysis.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="https://www.trackrights.com/"
                  className="text-sm text-purple-200 hover:text-white"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.trackrights.com/#features"
                  className="text-sm text-purple-200 hover:text-white"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.trackrights.com/#testimonials"
                  className="text-sm text-purple-200 hover:text-white"
                >
                  Testimonials
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="https://www.trackrights.com/privacy"
                  className="text-sm text-purple-200 hover:text-white"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.trackrights.com/terms"
                  className="text-sm text-purple-200 hover:text-white"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-purple-500 flex justify-between items-center">
          <div className="text-sm text-purple-200">
            © {new Date().getFullYear()} TrackRights. All rights reserved.
          </div>
          <ServerStatus />
        </div>
        <div className="mt-4 text-sm text-purple-200 flex items-center">
          <span className="mr-2">
            By using this website, you agree to our use of cookies. We use cookies
            to provide you with a great experience and to help our website run
            effectively.{' '}
            <Link
              href="https://www.trackrights.com/cookies"
              className="underline hover:text-white"
            >
              Learn more
            </Link>
          </span>
        <Link href="https://www.spotify.com" aria-label="Spotify Home Page">
  <Image
    src="/spotify-partner-logo.png"
    alt="Spotify Logo"
    width={250}
    height={250}
    className="hover:opacity-80 transition-opacity duration-200 rounded-full shadow-lg"
  />
</Link>
        </div>
      </div>
    </footer>
  );
}