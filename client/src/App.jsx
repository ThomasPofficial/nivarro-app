import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { getStoredUser } from './hooks/useAuth';
import { useThread } from './hooks/useThread';
import api from './api';
import AuthPage from './pages/AuthPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import ThreadList from './components/ThreadList';
import ContactRequestBanner from './components/ContactRequestBanner';
import IconRail from './components/IconRail';
import SearchPanel from './components/SearchPanel';
import TeamsPanel from './components/TeamsPanel';
import Greeting from './components/Greeting';

const ChatWindow = React.lazy(() => import('./components/ChatWindow'));

function AppMain({ user, token }) {
  const threads = useThread(token);
  const [activePanel, setActivePanel] = useState('messages');
  const [activeThread, setActiveThread] = useState(null);

  async function openThread(threadOrUser) {
    // SearchPanel passes a user object for connected users; resolve it to a real thread
    if (threadOrUser && !threadOrUser.participants) {
      try {
        const { data: threads } = await api.get('/threads');
        const match = threads.find(t =>
          t.participants?.some(p => (p._id || p).toString() === threadOrUser._id.toString())
        );
        if (match) {
          setActiveThread(match);
          setActivePanel('messages');
          return;
        }
      } catch { /* fall through to set whatever we have */ }
    }
    setActiveThread(threadOrUser);
    setActivePanel('messages');
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-primary)' }}>
      <IconRail active={activePanel} onSelect={setActivePanel} />

      {activePanel === 'messages' && (
        <ThreadList token={token} userId={user._id} onSelect={setActiveThread} onCompose={() => setActivePanel('search')} />
      )}
      {activePanel === 'search' && (
        <SearchPanel onOpenThread={openThread} />
      )}
      {activePanel === 'teams' && (
        <TeamsPanel threads={threads} onSelect={openThread} />
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', height: 52, boxSizing: 'border-box', flexShrink: 0 }}>
          <Greeting />
        </div>
        <ContactRequestBanner token={token} />
        {activeThread ? (
          <React.Suspense fallback={null}>
            <ChatWindow thread={activeThread} userId={user._id} token={token} />
          </React.Suspense>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(getStoredUser);
  const token = localStorage.getItem('token');

  if (!user || !token) {
    return (
      <ThemeProvider>
        <AuthPage onAuth={u => setUser(u)} />
      </ThemeProvider>
    );
  }

  if (!user.profile_complete) {
    return (
      <ThemeProvider>
        <ProfileSetupPage onComplete={() => setUser(u => ({ ...u, profile_complete: true }))} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <AppMain user={user} token={token} />
    </ThemeProvider>
  );
}
