import type { Metadata } from 'next';
import Link from 'next/link';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = {
  title: `Brand | ${BRAND.productName}`,
  description:
    'Brand profile for ASDEV and NexaVPN, including operating principles, engineering posture, and collaboration channel.',
  alternates: {
    canonical: '/brand',
  },
};

export default function BrandPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND.masterBrandName,
    url: BRAND.siteUrl,
    founder: {
      '@type': 'Person',
      name: BRAND.ownerName,
      jobTitle: 'Production-Grade Web Systems Consultant',
    },
    brand: {
      '@type': 'Brand',
      name: BRAND.productName,
    },
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <section className="container mx-auto max-w-4xl px-4 py-16 space-y-10">
        <header className="space-y-4">
          <p className="text-sm font-semibold tracking-wide text-cyan-400">ASDEV Brand Profile</p>
          <h1 className="text-3xl md:text-4xl font-extrabold">
            {BRAND.productName} under {BRAND.masterBrandName}
          </h1>
          <p className="text-slate-300">{BRAND.positioningEn}</p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-xl font-bold">Owner and Role</h2>
          <p className="mt-3 text-slate-300">
            {BRAND.ownerName} leads architecture decisions, CI/CD hardening, and production reliability controls for this
            product.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-xl font-bold">Brand Relationship</h2>
          <p className="mt-3 text-slate-300">
            {BRAND.productName} is a product line under {BRAND.masterBrandName}. Product-level UX and messaging remain
            domain-specific, while quality and engineering standards are inherited from the master brand.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-xl font-bold">Commercial and Consulting Contact</h2>
          <p className="mt-3 text-slate-300">
            For integration partnerships or production hardening consulting, use the primary intake path from the main page.
          </p>
          <Link
            href={BRAND.primaryContactPath}
            className="inline-flex mt-4 items-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white hover:from-cyan-400 hover:to-blue-500"
          >
            Back to Home
          </Link>
        </section>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}
