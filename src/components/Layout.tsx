import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const Layout: React.FC = () => {
    const location = useLocation();
    const isResults = location.pathname.includes('results');

    return (
        <div className="min-h-screen flex flex-col font-sans text-foreground bg-background transition-colors duration-300">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-surface/80 backdrop-blur-md supports-[backdrop-filter]:bg-surface/60">
                <div className="container mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 md:px-8">
                    <div className="flex items-center gap-2">
                        <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
                            <span className="text-primary">Diet</span>Calculator
                        </Link>
                    </div>

                    <nav className="flex items-center gap-6 text-sm font-medium">
                        <Link
                            to="/"
                            className={`transition-colors hover:text-primary ${!isResults ? 'text-primary' : 'text-muted'}`}
                        >
                            Calculator
                        </Link>
                        {/* Add more nav items if needed */}
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container max-w-screen-xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="border-t border-border-subtle bg-surface/50 py-8">
                <div className="container max-w-screen-xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted">
                    <p>© {new Date().getFullYear()} Diet Calculator. All rights reserved.</p>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                        <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
