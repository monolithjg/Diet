import React from 'react';
import { cn } from '../../lib/utils';

interface LayoutProps {
    children: React.ReactNode;
    className?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, className }) => {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
            <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🥗</span>
                        <span className="text-xl font-medium tracking-tight text-foreground">
                            Diet Calculator
                        </span>
                    </div>
                    {/* Placeholder for future nav items or user menu */}
                </div>
            </header>

            <main className={cn("container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-5xl", className)}>
                {children}
            </main>

            <footer className="border-t border-border-subtle bg-surface mt-auto">
                <div className="container mx-auto px-4 md:px-6 py-8 text-center text-sm text-muted">
                    <p>&copy; {new Date().getFullYear()} Diet Calculator. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};
