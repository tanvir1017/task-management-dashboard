type LoadingScreenProps = {
  variant?: "auth" | "app";
};

function ShimmerLine({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-full bg-gray-200 dark:bg-gray-800 ${className}`} />;
}

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white/80 p-8 shadow-theme-lg backdrop-blur-sm dark:border-white/5 dark:bg-white/5">
            <div className="space-y-6">
              <div className="flex items-center justify-center">
                <div className="h-12 w-12 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
              </div>

              <div className="space-y-3 text-center">
                <ShimmerLine className="mx-auto h-8 w-40" />
                <ShimmerLine className="mx-auto h-4 w-60" />
                <ShimmerLine className="mx-auto h-4 w-48" />
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <ShimmerLine className="h-4 w-20" />
                  <div className="h-11 rounded-lg bg-gray-100 dark:bg-gray-800/80" />
                </div>
                <div className="space-y-2">
                  <ShimmerLine className="h-4 w-24" />
                  <div className="h-11 rounded-lg bg-gray-100 dark:bg-gray-800/80" />
                </div>
                <div className="h-11 rounded-lg bg-brand-500/20" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative hidden overflow-hidden bg-[radial-gradient(circle_at_top,rgba(70,95,255,0.32),transparent_55%),linear-gradient(180deg,#161950_0%,#252dae_100%)] lg:flex lg:items-center lg:justify-center">
          <div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(255,255,255,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.09)_1px,transparent_1px)] bg-size-[48px_48px]" />
          <div className="relative w-full max-w-xl px-10">
            <div className="rounded-4xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-sm">
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 animate-pulse rounded-2xl bg-white/25" />
                  <div className="space-y-3">
                    <ShimmerLine className="h-7 w-44 bg-white/20" />
                    <ShimmerLine className="h-4 w-72 bg-white/15" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="h-28 rounded-2xl bg-white/10" />
                  <div className="h-28 rounded-2xl bg-white/10" />
                  <div className="h-28 rounded-2xl bg-white/10" />
                  <div className="h-28 rounded-2xl bg-white/10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <span className="sr-only">Loading authentication screen</span>
    </div>
  );
}

function AppLoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">
        <div className="w-full rounded-3xl border border-gray-200 bg-white p-6 shadow-theme-lg dark:border-white/5 dark:bg-white/5 sm:p-8">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2">
                <ShimmerLine className="h-7 w-36" />
                <ShimmerLine className="h-4 w-56" />
              </div>
              <div className="h-10 w-24 rounded-lg bg-gray-200 dark:bg-gray-800" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="h-24 rounded-2xl bg-gray-100 dark:bg-gray-800/80" />
              <div className="h-24 rounded-2xl bg-gray-100 dark:bg-gray-800/80" />
              <div className="h-24 rounded-2xl bg-gray-100 dark:bg-gray-800/80" />
            </div>

            <div className="space-y-3 rounded-2xl border border-gray-100 p-4 dark:border-gray-800">
              <ShimmerLine className="h-4 w-44" />
              <ShimmerLine className="h-4 w-full" />
              <ShimmerLine className="h-4 w-5/6" />
              <ShimmerLine className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
      <span className="sr-only">Loading application</span>
    </div>
  );
}

export default function LoadingScreen({ variant = "app" }: LoadingScreenProps) {
  return variant === "auth" ? <AuthLoadingScreen /> : <AppLoadingScreen />;
}