import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 text-center">
      <h1 className="text-4xl font-bold mb-4">User Not Found</h1>
      <p className="text-lg mb-8">
        The user profile you're looking for doesn't exist or has been removed.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
      >
        Return to Homepage
      </Link>
    </div>
  );
}
