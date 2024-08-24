"use client";
import React, { useState } from 'react';
import ResponsiveMenuBar from '@/components/nav-bar';
import Footer from '@/components/footer';
import SAQ from '@/components/saq-question';

export default function Home() {
  const [saqList, setSaqList] = useState<number[]>([]);

  const handleButtonClick = () => {
    setSaqList([...saqList, saqList.length]);
    setSaqList([saqList.length, ...saqList]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ResponsiveMenuBar />
      <main className="flex-grow flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4">Welcome to form-creator</h1>
          <p className="text-2xl">This is the future of education...</p>
          <button
            onClick={handleButtonClick}
            className="bg-blue-500 text-white px-4 py-3 rounded mt-4"
          >
            +
          </button>
          {saqList.map((id) => (
            <div className='p-4'>
            <SAQ key={id} />
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}