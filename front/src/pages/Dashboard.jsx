import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SummaryPage from './SummaryPage';
import SavingsPage from './SavingsPage';
import TransactionsPage from './TransactionsPage';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('summary');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <div
        style={{
          padding: 'var(--spacing-lg)',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-card)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Welcome + Logout */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--spacing-md)'
            }}
          >
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              Welcome, {user?.name}! ({user?.email})
            </p>
            <button onClick={handleLogout} className="btn btn-danger">
              Logout
            </button>
          </div>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <button
              className={`btn ${activeTab === 'summary' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('summary')}
              style={{
                background: activeTab === 'summary' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'summary' ? 'white' : 'var(--color-text)',
                border: activeTab === 'summary' ? 'none' : '1px solid var(--color-border)'
              }}
            >
              Summary
            </button>
            <button
              className={`btn ${activeTab === 'savings' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('savings')}
              style={{
                background: activeTab === 'savings' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'savings' ? 'white' : 'var(--color-text)',
                border: activeTab === 'savings' ? 'none' : '1px solid var(--color-border)'
              }}
            >
              Savings
            </button>
            <button
              className={`btn ${activeTab === 'transactions' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('transactions')}
              style={{
                background: activeTab === 'transactions' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'transactions' ? 'white' : 'var(--color-text)',
                border: activeTab === 'transactions' ? 'none' : '1px solid var(--color-border)'
              }}
            >
              Transactions
            </button>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div style={{ flex: 1, background: '#F9FAFB' }}>
        {activeTab === 'summary' && <SummaryPage />}
        {activeTab === 'savings' && <SavingsPage />}
        {activeTab === 'transactions' && <TransactionsPage />}
      </div>
    </div>
  );
}
