import type { FC } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Icon } from '../ui/Icon';

interface LayoutProps {
    className?: string;
}

export const Layout: FC<LayoutProps> = ({ className }) => {
    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary/20">
            <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
                <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                    <Link
                        to="/"
                        className="flex items-center gap-2 transition-opacity hover:opacity-80"
                        aria-label="Nourish calculator home"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"><Icon name="leaf" /></span>
                        <span className="text-lg font-semibold tracking-tight text-foreground">
                            Nourish
                        </span>
                    </Link>
                    {/* Placeholder for future nav items or user menu */}
                </div>
            </header>

            <main className={cn("container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-5xl", className)}>
                <Outlet />
            </main>

            <footer className="bg-surface-subtle mt-auto">
                <div className="container mx-auto px-4 md:px-6 py-8 text-center text-sm text-muted">
                    <p>&copy; {new Date().getFullYear()} Nourish. Personal nutrition, made practical.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
