"use client";
import React, { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Footer from '@/components/footer';
import NavBar from '@/components/nav-bar';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FaGoogle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { MousePointer } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function Login() {
  const router = useRouter();
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const footerLinks = [
    { text: "Privacy", href: "#" },
    { text: "Terms & Conditions", href: "#" },
    { text: "Twitter", href: "https://twitter.com/" },
  ]
  
  const handleGoogleAuth = async (isSignUp: boolean, role?: string) => {
    const redirectTo = `${window.location.origin}/auth/v1/callback?isSignUp=${isSignUp}${role ? `&role=${role}` : ''}`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
          isSignUp: isSignUp ? 'true' : 'false',
          ...(role && { role }),
        },
      },
    });

    if (error) {
      alert(error.message);
    }
  };

  return (
<>
    <NavBar />
    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f7] p-8">
      <Card className="w-full max-w-[1440px] rounded-[15px]">
        <CardContent className="flex flex-col items-center p-8">
          {/* Logo/Image Section */}
          <div className="mb-8 w-[266px]">
            <img
              src="/logo.png"
              alt="Gist growth"
              className="object-cover"
            />
          </div>

          {/* Main Content */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 font-bold text-3xl tracking-[0.60px] text-[#514b5f]">
              Welcome to the Future of Grading
            </h1>
            <p className="font-semibold text-[25px] text-[#8b5dff80] tracking-[0.50px]">
              Faster than ever before...
            </p>
          </div>

          {/* Buttons */}
          <div className="mb-8 space-y-6 w-[376px]">
          <Button
              variant="outline"
              className="w-full h-[63px] text-xl font-semibold text-[#33333394] bg-white shadow-[0px_4px_4px_#00000040]"
              onClick={() => handleGoogleAuth(true, 'Teacher')}
            >
              <MousePointer className="mr-4 h-6 w-6" />
              Click here to Sign up
            </Button>
            <Button
              variant="outline"
              className="w-full h-[63px] text-xl font-semibold text-[#33333394] bg-white shadow-[0px_4px_4px_#00000040]"
              onClick={() => handleGoogleAuth(false)}
            >
              <FaGoogle className=''/>
              <p className='pl-4'>Sign in with Google</p>
            </Button>


          </div>

          {/* Steps Text */}
          <p className="mb-12 text-center font-semibold text-[25px] text-[#00000063] tracking-[0.50px]">
            In three easy steps
            <br />
            Upload -&gt; Grade -&gt; Details.
          </p>

          {/* Footer Links */}
          <div className="flex gap-6 text-xl font-semibold text-[#8b5dff96]">
            {footerLinks.map((link, index) => (
              <React.Fragment key={link.text}>
                <a href={link.href} className="hover:text-[#8b5dff]">
                  {link.text}
                </a>
                {index < footerLinks.length - 1 && (
                  <Separator orientation="vertical" className="h-6" />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </>
  );
}