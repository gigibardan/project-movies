export default function SkeletonRow() {
  return (
    <section>
      <div className="mb-3 px-4 sm:px-6 lg:px-8">
        <div className="h-6 w-48 animate-pulse rounded bg-white/10" />
      </div>
      <div className="flex gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="w-[140px] shrink-0 sm:w-[170px] lg:w-[190px]">
            <div className="aspect-[2/3] animate-pulse rounded-lg bg-white/5" />
            <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-white/5" />
            <div className="mt-1 h-3 w-1/3 animate-pulse rounded bg-white/5" />
          </div>
        ))}
      </div>
    </section>
  );
}