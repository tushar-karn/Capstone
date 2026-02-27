import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function DashboardLayout() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="dashboard-layout">
            <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
            <div className={`main-content ${collapsed ? 'collapsed' : ''}`}>
                <Navbar onMenuToggle={() => setCollapsed(!collapsed)} />
                <main className="py-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
