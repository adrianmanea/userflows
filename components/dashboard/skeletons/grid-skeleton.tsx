export function GridSkeleton() {
  return (
    <div className="space-y-10">
      {/* Flows Skeleton */}
      <section className="space-y-4">
        <div className="h-7 w-32 bg-muted rounded-md animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-[4/3] rounded-lg bg-muted animate-pulse border border-border"
            />
          ))}
        </div>
      </section>

      {/* Components Skeleton */}
      <section className="space-y-4">
        <div className="h-7 w-48 bg-muted rounded-md animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="group relative flex flex-col space-y-3">
              {/* Thumbnail */}
              <div className="aspect-[4/3] w-full rounded-lg bg-muted animate-pulse border border-border" />

              {/* Meta */}
              <div className="space-y-2 px-1">
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
