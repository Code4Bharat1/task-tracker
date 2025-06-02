'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { usePermissionStore } from '@/store/permissionStore';

const RouteGuard = ({ featureKey, children }) => {
  const router = useRouter();
  const { features, maxFeatures } = usePermissionStore();

  const isAllowed = featureKey
    ? features.includes(featureKey) && !maxFeatures.includes(featureKey)
    : true;

  useEffect(() => {
    if (!isAllowed) {
      router.replace('/dashboard');
    }
  }, [isAllowed, router]);

  if (!isAllowed) return null; // optional: show loader

  return children;
};

export default RouteGuard;
