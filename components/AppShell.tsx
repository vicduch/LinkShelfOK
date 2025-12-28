import React from 'react';

interface AppShellProps {
    sidebar: React.ReactNode;
    children: React.ReactNode;
    mobileNav?: React.ReactNode;
    header?: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ sidebar, children, mobileNav, header }) => {
    return (
        <div className="flex min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] antialiased">
            {/* Sidebar - Desktop only */}
            <div className="hidden md:block">
                {sidebar}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen w-full">
                {/* Mobile Header */}
                {header}

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-8 md:pb-8 lg:p-12">
                    <div className="w-full max-w-[1200px] mx-auto">
                        {children}
                    </div>
                </main>

                {/* Mobile Nav - Fixed at bottom */}
                {mobileNav}
            </div>
        </div>
    );
};

export default AppShell;
