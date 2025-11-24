// DEPRECATED: useRequireSubscription será removido
// Use useSubscription().requireSubscription() ao invés disso

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSubscription } from './useSubscription';

export function useRequireSubscription() {
  console.warn('DEPRECATED: useRequireSubscription será removido. Use useSubscription() hook.');

  const router = useRouter();
  const { status, loading, requireSubscription } = useSubscription();

  useEffect(() => {
    if (!loading) {
      requireSubscription('/subscription');
    }
  }, [loading, status, requireSubscription]);

  return { loading };
}