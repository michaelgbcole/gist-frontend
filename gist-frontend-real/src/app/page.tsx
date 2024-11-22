"use client";
import * as React from 'react';
import { features } from '@/lib/features';
import { navItems } from '@/lib/navigation';
import { sections } from '@/lib/sections';
import { FeatureCardProps, NavItemProps, SectionProps } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';

const LandingPage: React.FC = () => {
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Files were selected, now redirect to login
      router.push('/login');
    }
  };

  const renderFeatureCard = ({ icon, title, description, iconAlt }: FeatureCardProps) => (
    <div className="flex flex-col gap-6 px-6 pt-6 pb-8 w-full bg-white rounded-2xl shadow-lg">
      <img
        loading="lazy"
        src={icon}
        alt={iconAlt}
        className="w-12 h-12"
      />
      <h3 className="text-xl font-semibold text-slate-950">
        {title}
      </h3>
      <p className="text-base text-gray-600">
        {description}
      </p>
    </div>
  );


  const renderSection = ({ number, title, description, imageUrl, imageAlt }: SectionProps, index: number) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <div className={`flex flex-col justify-center space-y-6 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
        <span className="text-sm font-medium tracking-wide text-violet-500">
          {number}
        </span>
        <h2 className="text-4xl md:text-5xl font-bold text-slate-950">
          {title}
        </h2>
        <p className="text-xl text-gray-500">
          {description}
        </p>
        <button
          className="px-4 py-2 text-sm w-fit font-medium bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
          onClick={() => router.push('/login')}
        >
          Get Started
        </button>
      </div>
      {imageUrl && (
        <div className={`flex justify-center items-center bg-slate-50 rounded-xl p-8 ${index % 2 === 1 ? 'md:order-1' : ''}`}>
          <img
            loading="lazy"
            src={imageUrl}
            alt={imageAlt}
            className="w-full max-w-lg object-contain"
          />
        </div>
      )}
    </div>
  );
  const headingText = ["Upload Essays", "&", "Grade within minutes."];

  const renderHeroSection = () => (
    <section className="bg-white py-24">
      <div className="container mx-auto px-4">
        <div className="">
          <div className="absolute inset-0 -mx-4 overflow-hidden">
            <img
              src="/pattern.png"
              alt=""
              className="w-full h-full object-cover"
              aria-hidden="true"
            />
          </div>

          <div className="relative mx-auto max-w-5xl bg-white rounded-3xl border border-gray-200 shadow-lg p-8">
            <div className="relative">
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
              </div>

              <div className="relative border-4 border-dashed border-gray-200 rounded-2xl p-8 md:p-12">
                <div className="text-center max-w-2xl mx-auto">
                  <h1 className="text-4xl md:text-5xl font-bold text-slate-950 mb-12">
                    Tedious grading sucks
                  </h1>

                  <div className="flex justify-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".doc,.docx,.pdf,.txt"
                      id="file-upload"
                    />
                    <button
                      className="group inline-flex items-center justify-center space-x-3 px-8 py-4 text-2xl font-bold text-violet-500 bg-white rounded-2xl border border-neutral-200 shadow-lg hover:bg-violet-50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <img
                        src="https://cdn.builder.io/api/v1/image/assets/TEMP/fd2147ed53f227f951212616f0b503b4a389301dd59b8145b57e3da4e8782cc9"
                        alt="Upload icon"
                        className="w-8 h-8"
                      />
                      <span>Upload your Essays Here</span>
                    </button>
                  </div>

                  <p className="mt-12 text-lg text-zinc-500">
                    Create, Grade, and produce Feedback faster than ever before.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <main className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm z-50 py-4">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between">
            <a href="/" className="flex-shrink-0">
              <img
                src="/logo.png"
                alt="Brand logo"
                className="w-48 h-auto"
              />
            </a>


            <div className="flex items-center space-x-4">
              <button
                className="px-4 py-2 text-sm font-medium bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
                onClick={() => router.push('login')}
              >
                Get Started
              </button>
              <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </nav>
        </div>
      </header>

      <div className="pt-20">
        {renderHeroSection()}

        <section className="py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-slate-950 mb-16">
              Powerful tools for Educators
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index}>{renderFeatureCard(feature)}</div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container mx-auto px-4">
            {sections.map((section, index) => (
              <div key={index} className={index > 0 ? "mt-24" : ""}>
                {renderSection(section, index)}
              </div>
            ))}
          </div>
        </section>
      </div>
      <Card className="w-full bg-purple-500 rounded-none border-0">
      <CardContent className="flex flex-col items-center gap-6 px-8 py-8 md:px-16">
        <div className="flex flex-col items-center w-full">
          <h1 className="text-4xl font-bold text-white text-center leading-10">
            Upload Essays & Grade within minutes.
          </h1>
        </div>

        <button className="flex items-center justify-center px-4 py-2 bg-white border-2 border-black rounded-full hover:bg-gray-200">
          <span className="text-black font-medium">
            Get Started Now
          </span>
        </button>
        
        {/* Using a placeholder image since external images aren't supported */}
        <div className="w-24 h-8">
          <img
            className="w-full h-full"
            alt="Vector"
            src="/Vector.svg"
          />
        </div>
      </CardContent>
    </Card>

      <footer className="border-t border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <a href="/" className="flex-shrink-0">
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/8c4c766d6ad6f6efa81ecd09e389aebf9e235e6a0384be6b656c1962ed281313"
                alt="Footer logo"
                className="w-48 h-auto"
              />
            </a>
            <nav className="flex items-center space-x-8">
              <a href="/login" className="text-slate-950 hover:text-violet-500 transition-colors">Sign In</a>
              <a href="#beta" className="text-slate-950 hover:text-violet-500 transition-colors">BETA</a>
              <a href="#coming-soon" className="text-slate-950 hover:text-violet-500 transition-colors">Coming Soon</a>
              <a href="#coming-soon-2" className="text-slate-950 hover:text-violet-500 transition-colors">Coming Soon</a>
            </nav>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default function Dashboard() {
  return <LandingPage />;
}