export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="text-lg font-black tracking-[-0.03em] text-slate-950">
            Cholna Store
          </p>
          <p className="mt-1 max-w-xl leading-6">
            Refined products for work, travel, and home. Powered by Next.js and MongoDB.
          </p>
        </div>
        <p>© 2026 Cholna Store. All rights reserved.</p>
      </div>
    </footer>
  );
}
