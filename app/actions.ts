'use server';

import { GoogleGenAI } from '@google/genai';
import { revalidatePath } from 'next/cache';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';

function getAiClient() {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured.');
  }
  return new GoogleGenAI({ apiKey });
}

export async function listStores() {
  const ai = getAiClient();
  const stores = [];
  const pager = await ai.fileSearchStores.list();
  for await (const store of pager) {
    stores.push(store);
  }
  return JSON.parse(JSON.stringify(stores));
}

export async function createStore(displayName: string) {
  const ai = getAiClient();
  const store = await ai.fileSearchStores.create({
    config: {
      displayName,
    },
  });
  revalidatePath('/');
  return JSON.parse(JSON.stringify(store));
}

export async function deleteStore(name: string) {
  const ai = getAiClient();
  await ai.fileSearchStores.delete({ name });
  revalidatePath('/');
}

export async function listDocuments(parent: string) {
  const ai = getAiClient();
  const docs = [];
  const pager = await ai.fileSearchStores.documents.list({ parent });
  for await (const doc of pager) {
    docs.push(doc);
  }
  return JSON.parse(JSON.stringify(docs));
}

export async function uploadDocument(formData: FormData, storeName: string) {
  const ai = getAiClient();
  const file = formData.get('file') as File;
  if (!file) throw new Error('No file provided');

  const tempDir = os.tmpdir();
  const tempFilePath = path.join(tempDir, file.name);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(tempFilePath, buffer);

  try {
    await ai.fileSearchStores.uploadToFileSearchStore({
      fileSearchStoreName: storeName,
      file: tempFilePath,
      config: {
        displayName: file.name,
        mimeType: file.type || 'application/octet-stream',
      },
    });
    // Return success to indicate operation started
    revalidatePath('/');
    return { success: true };
  } finally {
    await fs.unlink(tempFilePath).catch(() => null);
  }
}

export async function deleteDocument(name: string) {
  const ai = getAiClient();
  await ai.fileSearchStores.documents.delete({ name });
  revalidatePath('/');
}
