import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function CookiesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Cookie Policy</h1>
        <div className="prose max-w-none">
          <p>
            This website uses cookies to improve your browsing experience and
            provide personalized content. Cookies are small text files that are
            stored on your device when you visit a website. They help us
            understand how you use our site and enable us to provide a better
            user experience.
          </p>
          <h2 className="text-2xl font-semibold mt-6 mb-4">
            Types of Cookies We Use
          </h2>
          <ul>
            <li>
              <strong>Essential Cookies:</strong> These cookies are necessary
              for the website to function properly. They enable basic functions
              like page navigation and access to secure areas of the website.
              The website cannot function properly without these cookies.
            </li>
            <li>
              <strong>Analytics Cookies:</strong> We use these cookies to
              understand how visitors interact with our website. They help us
              measure and improve the performance of our site by providing
              information on the number of visitors, the pages they visit, and
              the actions they take.
            </li>
            <li>
              <strong>Functionality Cookies:</strong> These cookies allow the
              website to remember choices you make and provide enhanced
              features. For example, they can be used to remember your language
              preferences or login details.
            </li>
            <li>
              <strong>Advertising Cookies:</strong> These cookies are used to
              deliver advertisements that are relevant to you and your
              interests. They also help us measure the effectiveness of our
              advertising campaigns.
            </li>
          </ul>
          <h2 className="text-2xl font-semibold mt-6 mb-4">Managing Cookies</h2>
          <p>
            You can control and/or delete cookies as you wish. You can delete
            all cookies that are already on your computer and you can set most
            browsers to prevent them from being placed. If you do this, however,
            you may have to manually adjust some preferences every time you
            visit a site and some services and functionalities may not work.
          </p>
          <p>
            Most web browsers allow some control of most cookies through the
            browser settings. To find out more about cookies, including how to
            see what cookies have been set and how to manage and delete them,
            visit{' '}
            <a
              href="https://www.allaboutcookies.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline"
            >
              www.allaboutcookies.org
            </a>
            .
          </p>
          <h2 className="text-2xl font-semibold mt-6 mb-4">
            Changes to This Cookie Policy
          </h2>
          <p>
            We may update this Cookie Policy from time to time to reflect
            changes in our practices or for other operational, legal, or
            regulatory reasons. Please revisit this Cookie Policy regularly to
            stay informed about our use of cookies and related technologies.
          </p>
          <h2 className="text-2xl font-semibold mt-6 mb-4">Contact Us</h2>
          <p>
            If you have any questions about our use of cookies or other
            technologies, please email us at{' '}
            <a
              href="mailto:support@example.com"
              className="text-purple-600 hover:underline"
            >
              support@example.com
            </a>
            .
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
