import { db } from '../../../database/db';
import type { CustomCategory } from '../../../domain/models/CustomCategory';

// ১. নতুন ক্যাটাগরি তৈরি করা
export async function createCustomCategory(
  name: string,
  color: string,
  icon: string,
  isPasswordProtected: boolean,
  password?: string
): Promise<string> {
  const id = crypto.randomUUID();
  
  // সিম্পল পাসওয়ার্ড হ্যাশিং (Base64 for basic protection in local app)
  const passwordHash = isPasswordProtected && password ? btoa(password) : null;

  const newCategory: CustomCategory = {
    id,
    name,
    color,
    icon,
    isPasswordProtected,
    passwordHash,
    manhwaIds: [],
    createdAt: Date.now(),
  };

  await db.customCategories.add(newCategory);
  return id;
}

// ২. ক্যাটাগরি ডিলিট করা
export async function deleteCustomCategory(id: string): Promise<void> {
  await db.customCategories.delete(id);
}

// ৩. ক্যাটাগরিতে ম্যানহোয়া যোগ করা
export async function addManhwaToCategory(categoryId: string, manhwaId: string): Promise<void> {
  await db.customCategories.update(categoryId, {
    manhwaIds: (await db.customCategories.get(categoryId))?.manhwaIds || [],
  });
  
  // Dexie array update trick
  const category = await db.customCategories.get(categoryId);
  if (category && !category.manhwaIds.includes(manhwaId)) {
    category.manhwaIds.push(manhwaId);
    await db.customCategories.put(category);
  }
}

// ৪. ক্যাটাগরি থেকে ম্যানহোয়া সরানো
export async function removeManhwaFromCategory(categoryId: string, manhwaId: string): Promise<void> {
  const category = await db.customCategories.get(categoryId);
  if (category) {
    category.manhwaIds = category.manhwaIds.filter(id => id !== manhwaId);
    await db.customCategories.put(category);
  }
}

// ৫. পাসওয়ার্ড চেক করা (Returns true if correct or no password)
export async function verifyCategoryPassword(categoryId: string, inputPassword: string): Promise<boolean> {
  const category = await db.customCategories.get(categoryId);
  if (!category) return false;
  if (!category.isPasswordProtected) return true;
  
  return category.passwordHash === btoa(inputPassword);
}
