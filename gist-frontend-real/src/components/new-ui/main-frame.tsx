import { Button } from "@/components/ui/button";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Bookmark,
    FileStack,
    FileText,
    Home,
    LogOut,
    Settings,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Bell, ChevronDown, Search } from "lucide-react"
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter, usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";
import Link from "next/link";

const navigationItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: FileText, label: "Gist Quizzes", path: "/dashboard/quizzes" },
    { icon: Bookmark, label: "Gist Essay Grader", path: "/dashboard/essay-grader" },
    { icon: FileStack, label: "Rubric Creator", path: "/rubric-creator" },
];

type FrameProps = {
    children?: React.ReactNode;
};

type PrismaUser = {
    id: string;
    email: string;
    name: string | null;
    isPayer: boolean;
};

export default function Frame({ children }: FrameProps): JSX.Element {
    const [user, setUser] = useState<User | null>(null);
    const [prismaUser, setPrismaUser] = useState<PrismaUser | null>(null);
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [userImage, setUserImage] = useState<string>('');

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserImage(user?.user_metadata.avatar_url ?? '');
                setUser(user);
                const response = await fetch(`/api/user-data/${user.id}`);
                if (response.ok) {
                    const userData: PrismaUser = await response.json();
                    setPrismaUser(userData);
                }
            } else {
                router.push('/');
            }
            setLoading(false);
        };
        getUser();
    }, [supabase, router]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col h-screen bg-white">
            <div className="flex h-full">
                {/* Navigation Sidebar with Logo on top */}
                <div className="w-64 h-full flex flex-col">
                    {/* Logo Section */}
                    <div className="w-full px-6 pt-2">
                        <img 
                            src='/logo.png' 
                            alt="Logo" 
                            width={253} 
                            height={40} 
                            className="w-full h-auto"
                        />
                    </div>
                    
                    {/* Navigation Menu */}
                    <NavigationMenu className="w-full flex-grow mb-96">
                        <NavigationMenuList className="flex flex-col space-y-4 p-4 w-full mt-6">
                            {navigationItems.map((item, index) => (
                                <NavigationMenuItem key={index} className="w-full">
                                    <Link href={item.path} passHref>
                                        <NavigationMenuLink
                                            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors w-full ${
                                                pathname === item.path
                                                    ? "text-[#8b5dff] bg-blue-50 border-l-4 border-[#8b5dff]"
                                                    : "text-[#8a8a8a] hover:bg-gray-100 whitespace-nowrap"
                                            }`}
                                        >
                                            <item.icon
                                                className={`w-6 h-6 flex-shrink-0 ${
                                                    pathname === item.path ? "text-[#8b5dff]" : "text-[#8a8a8a]"
                                                }`}
                                            />
                                            <span className="font-bold text-xl">{item.label}</span>
                                        </NavigationMenuLink>
                                    </Link>
                                </NavigationMenuItem>
                            ))}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                <div className="flex flex-col flex-grow">
                    <header className="w-full bg-white border-b">
                        <div className="flex items-center justify-between px-8 py-7">
                            {/* Search Section */}
                            <div className="relative max-w-[438px] w-full">
                                <Input
                                    className="h-[50px] pl-12 rounded-full bg-white"
                                    placeholder="Search Quizzes, Rubrics, Students..."
                                />
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                            </div>

                            {/* Menu Items Section */}
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <Bell className="w-6 h-7 text-gray-600" />
                                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full" />
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="flex items-center gap-3 h-[50px] px-4 bg-blue-50 rounded-lg hover:bg-blue-100"
                                        >
                                            <Avatar className="h-10 w-10 bg-[#8b5dff]">
                                                <AvatarImage src={userImage} />
                                                <AvatarFallback>MN</AvatarFallback>
                                            </Avatar>
                                            <span className="font-semibold text-[15px] text-gray-800">
                                                {prismaUser?.name}
                                            </span>
                                            <ChevronDown className="w-3 h-3 text-gray-600" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-[200px]">
                                        <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Sign Out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </header>
                    <main className="flex-grow bg-slate-800">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}