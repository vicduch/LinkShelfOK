import React from 'react';

interface AppShellProps {
    sidebar: React.ReactNode;
    children: React.ReactNode;
    mobileNav?: React.ReactNode;
    header?: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ sidebar, children, mobileNav, header }) => {
    return (
        <div className="flex min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] antialiased selection:bg-[var(--accent-primary)] selection:text-white">
            {/* Sidebar - Desktop */}
            {sidebar}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Mobile Header */}
                {header && <div className="md:hidden sticky top-0 z-30">{header}</div>}

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth p-4 md:p-8 lg:p-12 w-full max-w-[1600px] mx-auto">
                    {children}
                </main>

                {/* Mobile Nav */}
                {mobileNav}
            </div>
        </div>
    );
};

export default AppShell;
