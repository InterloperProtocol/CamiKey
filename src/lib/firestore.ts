import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getFirebaseProjectId } from '@/lib/env';

export function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = getFirebaseProjectId();
  return initializeApp(projectId ? { projectId } : undefined);
}

export function getDb() {
  return getFirestore(getAdminApp());
}
