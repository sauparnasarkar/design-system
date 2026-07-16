import type { Meta, StoryObj } from '@storybook/react-vite';
import { Header } from './Header/Header';
import { SidebarNav } from './SidebarNav/SidebarNav';
import { Footer } from './Footer/Footer';
import { Card, CardHeader } from './Card/Card';
import { Button } from './Button/Button';
import { Tag } from './Tag/Tag';
import { Table } from './Table/Table';
import { Link } from './Link/Link';
import { Breadcrumb } from './Breadcrumb/Breadcrumb';
import { Tabs } from './Tabs/Tabs';
import { Logo } from './Logo/Logo';

const meta: Meta = {
  title: 'Shell/AppShell',
  parameters: { layout: 'fullscreen' },
};
export default meta;

export const ProductPage: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#fff' }}>
      <Header
        logo={<Logo product="green" />}
        searchPlaceholder="Search Entities, Reports and Instruments..."
      />
      <div style={{ display: 'flex', flex: 1 }}>
        <SidebarNav
          items={[
            { id: 'home', label: 'Home', icon: 'home' },
            { id: 'reports', label: 'Reports', icon: 'document', active: true },
            { id: 'entities', label: 'Entities', icon: 'user' },
            { id: 'instruments', label: 'Instruments', icon: 'grid' },
            { id: 'methodologies', label: 'Methodologies', icon: 'document' },
            { id: 'whats-new', label: "What's New", icon: 'bell' },
          ]}
          footerItems={[{ id: 'support', label: 'Customer Support', icon: 'info', hasFlyout: true }]}
        />
        <main style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Breadcrumb items={[{ label: 'Home', href: '#' }, { label: 'Reports' }]} />
          <Tabs
            items={[
              { id: 'overview', label: 'Overview' },
              { id: 'issuers', label: 'Issuers' },
              { id: 'research', label: 'Research' },
              { id: 'insights', label: 'Insights' },
            ]}
          />
          <Card
            header={
              <CardHeader
                title="Recent Research"
                actions={<Button variant="secondary" size="s" iconLeft="download">Download Selected</Button>}
              />
            }
            padding="inner-card"
          >
            <Table
              striped="even"
              columns={[
                {
                  key: 'title',
                  header: 'Report',
                  sortable: true,
                  render: (r) => <Link href="#" variant="default">{String(r.title)}</Link>,
                },
                { key: 'type', header: 'Type', render: (r) => <Tag size="small">{String(r.type)}</Tag> },
                { key: 'date', header: 'Published', align: 'right', sortable: true },
              ]}
              rows={[
                { title: 'Global Economic Outlook - June 2026', type: 'Special Report', date: '04 Jun 2026' },
                { title: 'Global Credit Outlook 2026 - Mid-Year Update', type: 'Outlook', date: '26 Jun 2026' },
                { title: 'Global Sovereigns Mid-Year Outlook 2026', type: 'Outlook', date: '08 Jun 2026' },
                { title: 'Global Risk Outlook: 2Q26', type: 'Special Report', date: '17 Apr 2026' },
              ]}
            />
          </Card>
        </main>
      </div>
      <Footer />
    </div>
  ),
};
