'use client';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 grid place-items-center bg-gray-50/80 backdrop-blur-sm z-50">
      {/* animated ring */}
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-blue-600/20 border-t-blue-600 animate-spin" />

        {/* pulse dot in the centre  */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-4 rounded-full bg-blue-600 animate-ping" />
        </div>
      </div>

      {/* subtle text underneath */}
      <p className="mt-6 text-sm font-medium text-gray-600 tracking-wide">
        Fetching request&nbsp;details…
      </p>
    </div>
  );
}