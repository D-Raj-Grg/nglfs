import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy - NGLFS",
  description: "Privacy policy for NGLFS anonymous messaging platform",
};

export default function PrivacyPage() {
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
              privacy policy
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
              introduction
            </h2>
            <p className="text-gray-700 leading-relaxed">
              welcome to NGLFS (ngl.link)! we take your privacy seriously. this
              policy explains how we collect, use, and protect your information
              when you use our anonymous messaging platform.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">
              information we collect
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  account information
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>email address (for authentication)</li>
                  <li>username (public)</li>
                  <li>display name (optional)</li>
                  <li>profile picture (optional)</li>
                  <li>bio (optional)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  message data
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>message content</li>
                  <li>timestamp</li>
                  <li>
                    sender IP address (hashed for privacy, raw for recipient
                    visibility)
                  </li>
                  <li>device type, browser, and operating system</li>
                  <li>timezone and language settings</li>
                  <li>screen resolution and device capabilities</li>
                  <li>referrer source (if from social media)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  analytics data
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>profile visit tracking</li>
                  <li>message send/receive statistics</li>
                  <li>usage patterns (for improving the service)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">
              how we use your information
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>to provide and maintain the messaging service</li>
              <li>to identify and prevent abuse (spam, harassment)</li>
              <li>to enforce rate limits and prevent misuse</li>
              <li>to provide message tracking features to recipients</li>
              <li>to improve user experience and platform features</li>
              <li>to comply with legal obligations</li>
            </ul>
          </section>

          {/* Anonymity & Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">
              anonymity & privacy protection
            </h2>
            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                <strong className="text-black">sender anonymity:</strong> we do
                not reveal sender identities to recipients. message senders
                remain anonymous unless they choose to identify themselves in
                the message content.
              </p>
              <p className="leading-relaxed">
                <strong className="text-black">IP address handling:</strong> we
                store both hashed and raw IP addresses. hashed IPs (with daily
                rotating salt) are used for rate limiting and abuse prevention.
                raw IPs are visible only to message recipients for their safety
                and security.
              </p>
              <p className="leading-relaxed">
                <strong className="text-black">data minimization:</strong> we
                only collect data necessary for platform functionality and user
                safety.
              </p>
            </div>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">
              data sharing & disclosure
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              we do not sell your personal information. we may share data only
              in these limited circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>with message recipients (tracking data for messages they receive)</li>
              <li>with law enforcement if legally required</li>
              <li>to protect our rights and prevent abuse</li>
              <li>with service providers who help us operate the platform (under strict confidentiality agreements)</li>
            </ul>
          </section>

          {/* User Rights */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">
              your rights
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>
                <strong className="text-black">access:</strong> you can view
                your profile and message data at any time
              </li>
              <li>
                <strong className="text-black">deletion:</strong> you can
                delete your messages and account
              </li>
              <li>
                <strong className="text-black">blocking:</strong> you can block
                senders by IP hash
              </li>
              <li>
                <strong className="text-black">reporting:</strong> you can
                report abusive messages
              </li>
              <li>
                <strong className="text-black">export:</strong> you can request
                a copy of your data
              </li>
            </ul>
          </section>

          {/* Security */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">security</h2>
            <p className="text-gray-700 leading-relaxed">
              we implement industry-standard security measures including
              encryption, hashing, rate limiting, and secure authentication. however, no
              system is 100% secure. you are responsible for keeping your
              account credentials confidential.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">
              cookies & tracking
            </h2>
            <p className="text-gray-700 leading-relaxed">
              we use essential cookies for authentication and session
              management. we also collect browser and device information to
              provide tracking features to message recipients. you can control
              cookie preferences in your browser settings.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">
              children's privacy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              our service is not intended for users under 13 years old. we do
              not knowingly collect information from children. if you believe a
              child has provided us with personal information, please contact us
              immediately.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">
              changes to this policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              we may update this privacy policy from time to time. we will
              notify users of significant changes via email or platform
              notification. continued use of the service after changes
              constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">contact us</h2>
            <p className="text-gray-700 leading-relaxed">
              if you have questions about this privacy policy or your data,
              please contact us at:{" "}
              <a
                href="mailto:privacy@ngl.link"
                className="text-[#FF006E] hover:text-[#FF4B7A] underline"
              >
                privacy@ngl.link
              </a>
            </p>
          </section>

          {/* GDPR & CCPA */}
          <section className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-black mb-4">
              gdpr & ccpa compliance
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              <strong className="text-black">for EU users (GDPR):</strong> you
              have the right to access, rectify, erase, restrict processing,
              data portability, and object to processing. contact us to exercise
              these rights.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong className="text-black">
                for California users (CCPA):
              </strong>{" "}
              you have the right to know what personal information we collect,
              delete your information, and opt-out of sale (we do not sell
              data).
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-900 transition-colors"
          >
            back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
