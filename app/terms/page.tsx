import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service - NGLFS",
  description: "Terms of service for NGLFS anonymous messaging platform",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF006E] via-[#FF4B7A] to-[#FF8C42] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>back to home</span>
          </Link>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-4xl font-bold text-black mb-2">
              terms of service
            </h1>
            <p className="text-gray-600">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">
              agreement to terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              by accessing or using NGLFS (ngl.link), you agree to be bound by
              these terms of service. if you do not agree to these terms, please
              do not use our service.
            </p>
          </section>

          {/* Service Description */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">
              service description
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              NGLFS is an anonymous messaging platform that allows users to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>create a public profile with a unique username</li>
              <li>receive anonymous messages from anyone</li>
              <li>send anonymous messages to other users</li>
              <li>view tracking information about received messages</li>
              <li>block senders and report abusive content</li>
            </ul>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">
              user accounts
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  account creation
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>you must be at least 13 years old to create an account</li>
                  <li>you must provide accurate and current information</li>
                  <li>you are responsible for maintaining account security</li>
                  <li>one account per person is allowed</li>
                  <li>usernames must not impersonate others or contain offensive content</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  account termination
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  we reserve the right to suspend or terminate accounts that
                  violate these terms, engage in abusive behavior, or misuse the
                  platform.
                </p>
              </div>
            </div>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">
              acceptable use policy
            </h2>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-black mb-2">
                you agree NOT to:
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>send threatening, harassing, or abusive messages</li>
                <li>send spam or unsolicited commercial messages</li>
                <li>share illegal content or engage in illegal activities</li>
                <li>send sexually explicit content to minors</li>
                <li>impersonate others or create fake accounts</li>
                <li>attempt to bypass rate limits or security measures</li>
                <li>scrape, crawl, or harvest data from the platform</li>
                <li>interfere with the platform's operation</li>
                <li>violate any applicable laws or regulations</li>
                <li>share hate speech, violent threats, or discriminatory content</li>
              </ul>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-900 font-semibold">
                ⚠️ violation of these policies may result in immediate account
                termination and potential legal action.
              </p>
            </div>
          </section>

          {/* Content & Messages */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">
              content & messages
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  your responsibility
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  you are solely responsible for the content of messages you
                  send. we do not endorse or take responsibility for user
                  content. anonymity does not grant immunity from consequences.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  our rights
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>we may review reported content</li>
                  <li>we may remove content that violates these terms</li>
                  <li>we may disclose content to law enforcement if required</li>
                  <li>we do not monitor all messages proactively</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  intellectual property
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  you retain ownership of your content. by using our service,
                  you grant us a license to store, display, and transmit your
                  content as necessary to provide the service.
                </p>
              </div>
            </div>
          </section>

          {/* Anonymity Limitations */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">
              anonymity & tracking
            </h2>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                <strong className="text-black">sender anonymity:</strong> while
                we do not reveal your identity to recipients, you should
                understand:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>recipients can see your IP address, device info, and other tracking data</li>
                <li>we log IP addresses and device information for security</li>
                <li>law enforcement can request identifying information with proper legal authorization</li>
                <li>you may reveal your identity through message content</li>
              </ul>
              <p className="leading-relaxed mt-4">
                <strong className="text-black">not truly anonymous:</strong>{" "}
                this platform provides limited anonymity for casual use. it is
                not designed for whistleblowers, journalists, or high-security
                communications.
              </p>
            </div>
          </section>

          {/* Rate Limits */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">
              rate limits & restrictions
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>10 messages per IP address per hour</li>
              <li>500 characters maximum per message</li>
              <li>rate limits apply to prevent spam and abuse</li>
              <li>we may adjust limits without notice</li>
            </ul>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">
              disclaimers & limitations
            </h2>

            <div className="space-y-4">
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <h3 className="text-lg font-semibold text-black mb-2">
                  "as is" service
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  the service is provided "as is" without warranties of any
                  kind. we do not guarantee uptime, message delivery, or freedom
                  from errors or security vulnerabilities.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  limitation of liability
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  we are not liable for any damages arising from your use of the
                  service, including but not limited to: harassment, emotional
                  distress, loss of data, security breaches, or third-party
                  actions. maximum liability is limited to the amount you paid
                  us (if any).
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  third-party links
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  our service may contain links to third-party websites. we are
                  not responsible for their content or practices.
                </p>
              </div>
            </div>
          </section>

          {/* Reporting & Safety */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">
              reporting & safety
            </h2>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                if you receive abusive, threatening, or illegal messages:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>use the "report" feature to flag the message</li>
                <li>use the "block sender" feature to prevent future messages</li>
                <li>contact local law enforcement if you feel threatened</li>
                <li>
                  contact us at{" "}
                  <a
                    href="mailto:safety@ngl.link"
                    className="text-[#FF006E] hover:text-[#FF4B7A] underline"
                  >
                    safety@ngl.link
                  </a>{" "}
                  for serious violations
                </li>
              </ul>
              <p className="leading-relaxed mt-4">
                we take safety seriously and will cooperate with law enforcement
                in cases of illegal activity.
              </p>
            </div>
          </section>

          {/* Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">
              privacy policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              your use of the service is also governed by our{" "}
              <Link
                href="/privacy"
                className="text-[#FF006E] hover:text-[#FF4B7A] underline font-semibold"
              >
                privacy policy
              </Link>
              . please review it to understand how we collect and use your data.
            </p>
          </section>

          {/* Modifications */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">
              changes to terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              we may modify these terms at any time. significant changes will be
              announced via email or platform notification. continued use of the
              service after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">
              governing law
            </h2>
            <p className="text-gray-700 leading-relaxed">
              these terms are governed by the laws of [Your Jurisdiction].
              disputes will be resolved in the courts of [Your Jurisdiction].
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">contact us</h2>
            <p className="text-gray-700 leading-relaxed">
              if you have questions about these terms, please contact us at:{" "}
              <a
                href="mailto:legal@ngl.link"
                className="text-[#FF006E] hover:text-[#FF4B7A] underline"
              >
                legal@ngl.link
              </a>
            </p>
          </section>

          {/* Acknowledgment */}
          <section className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-black mb-4">
              acknowledgment
            </h2>
            <p className="text-gray-700 leading-relaxed">
              by creating an account or using NGLFS, you acknowledge that you
              have read, understood, and agree to be bound by these terms of
              service and our privacy policy.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center space-y-4">
          <Link
            href="/"
            className="inline-block bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-900 transition-colors"
          >
            back to home
          </Link>

          <div className="flex justify-center gap-4 text-sm text-white/90">
            <Link href="/privacy" className="hover:text-white">
              privacy policy
            </Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-white">
              terms of service
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
