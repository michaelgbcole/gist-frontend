import Footer from "@/components/footer";
import ResponsiveMenuBar from "@/components/nav-bar";
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <ResponsiveMenuBar />
      <main className="flex-grow flex items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4">Welcome to Gist</h1>
          <p className="text-2xl mb-8">This is the future of education...</p>
          <Link legacyBehavior href="/login">
            <a className="relative inline-block px-8 py-3 font-medium group">
              <span className="absolute inset-0 w-full h-full transition duration-300 ease-out transform translate-x-1 translate-y-1 bg-blue-500 group-hover:-translate-x-0 group-hover:-translate-y-0"></span>
              <span className="absolute inset-0 w-full h-full bg-white border-2 border-blue-500 group-hover:bg-blue-500"></span>
              <span className="relative text-blue-500 group-hover:text-white">Go to Login</span>
            </a>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}