import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-rows-1 bg-light-200 text-dark-900 md:grid-cols-[1.05fr_1fr]">
      {/* Left hero (shown on md+) */}
      <div className="relative hidden overflow-hidden bg-dark-900 md:block">
        <div className="absolute inset-0">
          <Image
            src="/hero-bg.png"
            alt="Comfort background"
            fill
            priority
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-dark-900/90" />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between p-10 text-light-100">
          <Image src="/logo.svg" alt="Pillow Peek logo" width={48} height={18} className="h-8 w-12" />
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="space-y-4 flex flex-col items-center justify-center text-center">
              <p className="text-heading-1">Designed for Deep Sleep</p>
              <p className="max-w-md text-body text-light-100/80">
                Join thousands who trust Pillow Peek for comfort, pressure relief, and uninterrupted rest.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="h-2 w-2 rounded-full bg-light-100" />
                <span className="h-2 w-2 rounded-full bg-light-100/60" />
                <span className="h-2 w-2 rounded-full bg-light-100/60" />
              </div>
            </div>
          </div>
          <p className="text-footnote text-light-100/70">© {new Date().getFullYear()} Pillow Peek. All rights reserved.</p>
        </div>
      </div>

      {/* Right auth pane */}
      <div className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-14">
        {children}
      </div>
    </div>
  );
}


