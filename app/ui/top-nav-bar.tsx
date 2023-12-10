import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { Goal, BarChart2 } from 'lucide-react';

export default function TopNavBar() {
    return (
        <nav className="flex w-screen flex-row items-center justify-center mb-2 py-4 border-b border-gray-300 bg-primary-background text-primary-text">
            <Image
                src="/logo.png"
                width={50}
                height={50}
                alt="Soccer Stats Logo"
                className="mr-3"
            />
            <h2 className="w-max">Soccer Stats</h2>
            {/* <Link href="/">
                <div className="flex items-center">
                    <Goal className="mr-2" />Home
                </div>
            </Link> */}
            {/* <Link href="/statistics">
                <div className="flex items-center">
                    <BarChart2 className="mr-2" />Statistics
                </div>
            </Link> */}
        </nav>
    );
};