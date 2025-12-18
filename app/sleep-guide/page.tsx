import Card from "@/components/Card";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sleep Guide | Pillow-Peek",
  description: "Your path to better rest with our comprehensive sleep guide.",
};

const SLEEP_TOPICS = [
  {
    title: "Mattress Care",
    description: "Learn how to clean, rotate, and maintain your Pillow-Peek mattress to ensure it lasts for years of comfortable sleep.",
    imageSrc: "/mattress/mattress-1.webp",
    href: "#",
  },
  {
    title: "Firmness Finder",
    description: "Choosing between Soft, Medium, and Firm shouldn't be hard. Discover which support level matches your body type and sleep style.",
    imageSrc: "/mattress/mattress-2.webp",
    href: "#",
  },
  {
    title: "Sleeping Positions",
    description: "Whether you're a side, back, or stomach sleeper, we have tips to optimize your alignment and reduce morning stiffness.",
    imageSrc: "/mattress/mattress-3.webp",
    href: "#",
  },
];

export default function SleepGuidePage() {
  return (
    <main className="flex min-h-screen flex-col bg-light-100">
      {/* Hero Section */}
      <section className="relative h-[60vh] w-full overflow-hidden">
        <Image
          src="/bedroom-hero.png"
          alt="Peaceful bedroom with a comfortable mattress"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-dark-900/20" />
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <h1 className="text-center text-heading-1 text-light-100 drop-shadow-lg md:text-[84px]">
            Your Path to Better Rest
          </h1>
        </div>
      </section>

      {/* Grid Layout */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mb-12 text-center">
          <h2 className="text-heading-2 text-dark-900">Sleep Knowledge Base</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lead text-dark-700">
            Everything you need to know about choosing the right mattress and getting the best sleep of your life.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {SLEEP_TOPICS.map((topic) => (
            <Card
              key={topic.title}
              title={topic.title}
              description={topic.description}
              imageSrc={topic.imageSrc}
              href={topic.href}
              className="h-full border-none shadow-sm"
            />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-light-300 bg-light-200 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-heading-2 text-dark-900">Ready to sleep better?</h2>
          <p className="mt-4 text-lead text-dark-700">
            Our Sleep Guide is just the beginning. Find the mattress that feels right for you.
          </p>
          <div className="mt-10">
            <Link
              href="/mattresses"
              className="inline-flex items-center justify-center rounded-full bg-dark-900 px-8 py-4 text-body-medium text-light-100 transition-colors hover:bg-dark-700"
            >
              Find Your Mattress
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
