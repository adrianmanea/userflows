export const metadata = {
  title: "Terms of Service",
  description: "Terms of Service for PageInspo",
};

export default function TermsPage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

      <div className="prose dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <p>Last updated: January 2026</p>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing and using PageInspo ("the Service"), you accept and
            agree to be bound by the terms and provision of this agreement. In
            addition, when using these particular services, you shall be subject
            to any posted guidelines or rules applicable to such services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            2. Description of Service
          </h2>
          <p>
            PageInspo provides a pattern library for developers and designers to
            explore and copy UI components and flows. You are responsible for
            obtaining access to the Service and that access may involve third
            party fees (such as Internet service provider or airtime charges).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            3. Content and Copyright
          </h2>
          <p>
            The UI patterns and code snippets provided on PageInspo are for
            educational and inspiration purposes. While you are free to use the
            code in your own projects, you acknowledge that the original designs
            often belong to their respective copyright holders (e.g., Uber,
            Airbnb). We do not claim ownership of the original trademarked
            designs found in the "Sources" section.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            4. User Account
          </h2>
          <p>
            You are responsible for maintaining the confidentiality of the
            password and account, and are fully responsible for all activities
            that occur under your password or account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            5. Modifications to Service
          </h2>
          <p>
            PageInspo reserves the right at any time and from time to time to
            modify or discontinue, temporarily or permanently, the Service (or
            any part thereof) with or without notice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            6. Governing Law
          </h2>
          <p>
            These Terms shall be governed and construed in accordance with the
            laws of United States, without regard to its conflict of law
            provisions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            7. Contact Information
          </h2>
          <p>
            Any questions about the Terms of Service should be addressed to
            support@pageinspo.com.
          </p>
        </section>
      </div>
    </div>
  );
}
