"use client";

import Footer from '@/components/footer';
import ResponsiveMenuBar from '@/components/nav-bar';
import { useRouter } from 'next/navigation';

const boxes = [
  { id: 1, content: '+' },
  { id: 2, content: '0' },
  { id: 3, content: '1' },
  { id: 4, content: '2' },
  { id: 5, content: '3' },
  { id: 6, content: '4' },
];

export default function Home() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/form-creator');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ResponsiveMenuBar />
      <main className="min-h-screen bg-gray-700 p-12 flex justify-center">
        <div className="flex flex-wrap gap-x-8 gap-y-8 justify-center max-w-7xl max-h-7">
          {boxes.map((box) => (
            <div
              key={box.id}
              className={`
                w-96 h-56 flex items-center justify-center text-6xl font-bold cursor-pointer
                ${box.id === 1    
                  ? 'bg-gray-900 text-white rounded-3xl' 
                  : 'bg-gray-500 text-black rounded-3xl'}
              `}
              onClick={box.id === 1 ? handleClick : undefined}
            >
              {box.content}
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}