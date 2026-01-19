export const metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for PageInspo",
};

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

      <div className="prose dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <p>Last updated: January 2026</p>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            1. Introduction
          </h2>
          <p>
            Welcome to PageInspo. We respect your privacy and are committed to
            protecting your personal data. This privacy policy will inform you
            as to how we look after your personal data when you visit our
            website and tell you about your privacy rights and how the law
            protects you.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            2. Data We Collect
          </h2>
          <p>
            We may collect, use, store and transfer different kinds of personal
            data about you which we have grouped together follows:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Identity Data</strong> includes email address.
            </li>
            <li>
              <strong>Technical Data</strong> includes internet protocol (IP)
              address, your login data, browser type and version, time zone
              setting and location, browser plug-in types and versions,
              operating system and platform and other technology on the devices
              you use to access this website.
            </li>
            <li>
              <strong>Usage Data</strong> includes information about how you use
              our website, products and services.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            3. How We Use Your Data
          </h2>
          <p>
            We will only use your personal data when the law allows us to. Most
            commonly, we will use your personal data in the following
            circumstances:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Where we need to perform the contract we are about to enter into
              or have entered into with you.
            </li>
            <li>
              Where it is necessary for our legitimate interests (or those of a
              third party) and your interests and fundamental rights do not
              override those interests.
            </li>
            <li>
              Where we need to comply with a legal or regulatory obligation.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            4. Data Security
          </h2>
          <p>
            We have put in place appropriate security measures to prevent your
            personal data from being accidentally lost, used or accessed in an
            unauthorized way, altered or disclosed. In addition, we limit access
            to your personal data to those employees, agents, contractors and
            other third parties who have a business need to know.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            5. Contact Us
          </h2>
          <p>
            If you have any questions about this privacy policy or our privacy
            practices, please contact us at: support@pageinspo.com
          </p>
        </section>
      </div>
    </div>
  );
}
