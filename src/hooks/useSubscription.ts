import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from './useUser';
import { supabase } from '@/lib/supabase';

export interface SubscriptionStatus {
  hasAccess: boolean;
  isLifetime: boolean;
  isActive: boolean;
  isExpired: boolean;
  expiresAt?: Date;
  planType?: string;
  reason?: 'inactive' | 'expired' | 'error' | 'loading';
}

export function useSubscription() {
  const { user, isLifetime, hasActiveSubscription, hasExpiredAccess } = useUser();
  const router = useRouter();
  const [status, setStatus] = useState<SubscriptionStatus>({
    hasAccess: false,
    isLifetime: false,
    isActive: false,
    isExpired: false,
    reason: 'loading'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSubscriptionStatus();
  }, [user, isLifetime, hasActiveSubscription, hasExpiredAccess]);

  const checkSubscriptionStatus = () => {
    setLoading(true);

    if (!user) {
      setStatus({
        hasAccess: false,
        isLifetime: false,
        isActive: false,
        isExpired: false,
        reason: 'inactive'
      });
      setLoading(false);
      return;
    }

    // Verificar acesso vitalício
    if (isLifetime) {
      setStatus({
        hasAccess: true,
        isLifetime: true,
        isActive: true,
        isExpired: false,
        planType: 'lifetime'
      });
      setLoading(false);
      return;
    }

    // Verificar assinatura ativa
    if (hasActiveSubscription) {
      const expiresAt = user.access_expires_at ? new Date(user.access_expires_at) : undefined;
      setStatus({
        hasAccess: true,
        isLifetime: false,
        isActive: true,
        isExpired: false,
        expiresAt,
        planType: user.subscription_status || 'active'
      });
      setLoading(false);
      return;
    }

    // Verificar se expirou
    if (hasExpiredAccess) {
      setStatus({
        hasAccess: false,
        isLifetime: false,
        isActive: false,
        isExpired: true,
        expiresAt: user.access_expires_at ? new Date(user.access_expires_at) : undefined,
        reason: 'expired'
      });
      setLoading(false);
      return;
    }

    // Sem acesso
    setStatus({
      hasAccess: false,
      isLifetime: false,
      isActive: false,
      isExpired: false,
      reason: 'inactive'
    });
    setLoading(false);
  };

  const requireSubscription = (redirectTo: string = '/subscription') => {
    if (loading) return;

    if (!status.hasAccess) {
      router.push(`${redirectTo}?reason=${status.reason}`);
      return false;
    }

    return true;
  };

  const refreshStatus = async () => {
    try {
      // Forçar reload do user profile
      if (user?.id) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          // O useUser hook vai atualizar automaticamente via onAuthStateChange
          // Aqui apenas forçamos uma verificação
          checkSubscriptionStatus();
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const getSubscriptionDetails = () => {
    if (!user) return null;

    return {
      planType: user.subscription_status,
      expiresAt: user.access_expires_at ? new Date(user.access_expires_at) : null,
      customerId: user.stripe_customer_id,
      isLifetime: user.is_lifetime,
      paymentVerified: user.payment_verified
    };
  };

  return {
    status,
    loading,
    requireSubscription,
    refreshStatus,
    getSubscriptionDetails,
    hasAccess: status.hasAccess,
    isLifetime: status.isLifetime,
    isActive: status.isActive,
    isExpired: status.isExpired
  };
}
