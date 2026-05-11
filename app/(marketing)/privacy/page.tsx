export const metadata = {
  title: "Privacy",
  description: "How Brewmate handles your data.",
};

const updated = "2026-05-11";

export default function PrivacyPage() {
  return (
    <article className="space-y-6">
      <header className="border-b border-rule pb-6">
        <div className="eyebrow mb-3">policy · 個人情報</div>
        <h1 className="display text-4xl md:text-5xl mb-2">Privacy Policy</h1>
        <p className="font-mono text-[11px] uppercase tracking-widest text-ink-2">last updated · {updated}</p>
      </header>

      <Prose>
        <p>
          This is a plain-language summary of what Brewmate collects, why, and what you can do about it.
          For binding language, see the <a href="/terms">Terms</a>.
        </p>

        <H2>What we collect</H2>
        <ul>
          <li><b>Account</b>: when you sign in with Google we receive your email, name, and profile picture URL from Google.</li>
          <li><b>Brew data</b>: anything you type into the app — beans, equipment, brew logs, taste notes.</li>
          <li><b>AI suggestions</b>: the prompt sent to our AI provider (OpenRouter) contains your bean profile, gear names, recipe, and taste rating for that brew. We retain a copy of the suggestion attached to the brew.</li>
          <li><b>Usage</b>: anonymous page views and performance metrics via Vercel Analytics (no cookies, no cross-site tracking).</li>
        </ul>

        <H2>Where it lives</H2>
        <ul>
          <li>Database: Supabase (PostgreSQL). All rows are protected by row-level security; you can only read or write your own rows.</li>
          <li>Hosting: Vercel.</li>
          <li>AI: OpenRouter (free-tier model routing).</li>
        </ul>

        <H2>What we don&apos;t do</H2>
        <ul>
          <li>We don&apos;t sell your data.</li>
          <li>We don&apos;t advertise.</li>
          <li>We don&apos;t use your brew data to train our own models.</li>
        </ul>

        <H2>Your rights</H2>
        <p>
          You can export your data, delete your account, or change your mind at any time. Email
          <a href="mailto:hello@brewmate.app"> hello@brewmate.app</a> and we&apos;ll respond within seven days.
          We&apos;ll delete your account and all associated brew data on request.
        </p>

        <H2>Cookies</H2>
        <p>
          We use a single cookie group: Supabase auth cookies that keep you signed in. They are first-party,
          HTTP-only, and expire when you sign out.
        </p>

        <H2>Children</H2>
        <p>
          Brewmate is not directed at anyone under 13. If we learn we&apos;ve collected data from a child,
          we&apos;ll delete it.
        </p>

        <H2>Changes</H2>
        <p>
          When this policy changes materially, we&apos;ll surface a notice in-app and update the date at the top of this page.
        </p>
      </Prose>
    </article>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="prose-kissaten space-y-5 text-[15px] md:text-[16px] leading-relaxed text-ink-2 [&_h2]:display [&_h2]:text-2xl [&_h2]:text-ink [&_h2]:mt-8 [&_h2]:mb-2 [&_b]:text-ink [&_a]:text-persimmon [&_a]:underline [&_a]:underline-offset-4 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-1">
      {children}
    </div>
  );
}
function H2({ children }: { children: React.ReactNode }) {
  return <h2>{children}</h2>;
}
