import Link from "next/link";

type LegalSection = {
  title: string;
  body: string[];
};

type LegalPageProps = {
  title: string;
  updatedAt: string;
  intro: string;
  sections: LegalSection[];
};

export function LegalPage({ title, updatedAt, intro, sections }: LegalPageProps) {
  return (
    <main className="min-h-screen bg-[#f6f7f2] text-stone-950">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-5 py-8 sm:px-6 lg:px-8">
        <header className="border-b border-stone-300 pb-6">
          <Link
            href="/"
            className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700"
          >
            OrganicReach
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-normal sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 text-sm text-stone-600">Last updated: {updatedAt}</p>
          <p className="mt-5 text-base leading-7 text-stone-800">{intro}</p>
        </header>

        <div className="flex flex-col gap-6">
          {sections.map((section) => (
            <section key={section.title} className="border-b border-stone-200 pb-6">
              <h2 className="text-lg font-semibold text-stone-950">{section.title}</h2>
              <div className="mt-3 flex flex-col gap-3">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-7 text-stone-700">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
