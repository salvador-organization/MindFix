import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase, isConfigured } from '@/lib/supabase';
import { getLocalCurrentUser } from '@/lib/local-auth';

export function useRequireSubscription() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const currentUser = getLocalCurrentUser();
        if (!currentUser) {
          router.push('/login');
          return;
        }

        const email = currentUser?.email;
        if (!email) {
          router.push('/login');
          return;
        }

        if (!isConfigured() || !supabase) {
          setLoading(false);
          return;
        }

        const { data: user, error } = await supabase
          .from('users')
          .select('is_lifetime, access_expires_at, subscription_status, payment_verified')
          .eq('email', email)
          .single();

        if (error) {
          console.error('Erro ao buscar usuário no Supabase:', error);
          router.push('/subscription?reason=error');
          return;
        }

        if (!user) {
          setLoading(false);
          return;
        }

        if (user.is_lifetime === true) {
          setLoading(false);
          return;
        }

        if (user.access_expires_at && new Date(user.access_expires_at).getTime() > Date.now()) {
          setLoading(false);
          return;
        }

        if (user.subscription_status === 'active' && user.payment_verified === true) {
          setLoading(false);
          return;
        }

        router.push('/subscription?reason=inactive');
      } catch (err) {
        console.error('Erro no hook useRequireSubscription:', err);
        router.push('/subscription?reason=error');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { loading };
}