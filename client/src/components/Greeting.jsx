import React from 'react';
import { getStoredUser } from '../hooks/useAuth';

function timeGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'Good morning';
  if (h >= 12 && h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Greeting() {
  const user = getStoredUser();
  const firstName = user?.name?.split(' ')[0] || '';
  return (
    <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 14 }}>
      {timeGreeting()}, {firstName}
    </span>
  );
}
