import React from 'react';
import ResponsiveMenuBar from '@/components/nav-bar';
import Footer from '@/components/footer';


export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
    <ResponsiveMenuBar />
    <main className="flex-grow flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">Welcome to contact</h1>
        <p className="text-2xl">This is the future of education...</p>
      </div>
    </main>
    <Footer />
  </div>
  );
}