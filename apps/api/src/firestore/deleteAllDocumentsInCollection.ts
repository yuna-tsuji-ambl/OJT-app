import type { Firestore } from '@google-cloud/firestore';

export async function deleteAllDocumentsInCollection(
  db: Firestore,
  collectionName: string,
): Promise<void> {
  const snapshot = await db.collection(collectionName).get();

  if (snapshot.empty) {
    return;
  }

  const batch = db.batch();

  for (const document of snapshot.docs) {
    batch.delete(document.ref);
  }

  await batch.commit();
}
