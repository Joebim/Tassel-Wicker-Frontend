import SiteLayoutClient from '@/components/layout/SiteLayoutClient';

export default function SiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <SiteLayoutClient>{children}</SiteLayoutClient>;
}

