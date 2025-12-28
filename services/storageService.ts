
import { LinkItem } from "../types";
import { supabase } from "./supabaseClient";

const COLLECTION = 'links';
const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

// --- LOCAL STORAGE FALLBACK LOGIC ---
const getLocalLinks = (userId: string): LinkItem[] => {
  const data = localStorage.getItem(`linkshelf_data_${userId}`);
  return data ? JSON.parse(data) : [];
};

const saveLocalLinks = (userId: string, links: LinkItem[]) => {
  localStorage.setItem(`linkshelf_data_${userId}`, JSON.stringify(links));
};

// --- REMOTE STORAGE LOGIC ---

// Helper to map DB row (snake_case) to LinkItem (camelCase)
const mapRowToLinkItem = (row: any): LinkItem => ({
  id: row.id,
  url: row.url,
  title: row.title,
  summary: row.summary,
  category: row.category,
  tags: row.tags,
  isRead: row.isread, // Map lowercase from DB
  createdAt: row.createdat // Map lowercase from DB
});

// Real-time subscription to links
export const subscribeToLinks = (userId: string, callback: (links: LinkItem[]) => void) => {
  if (!isSupabaseConfigured) {
    callback(getLocalLinks(userId));
    return () => { };
  }

  // Initial fetch
  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from(COLLECTION)
      .select('*')
      .eq('user_id', userId)
      .order('createdat', { ascending: false }); // Use DB column name

    if (error) {
      console.error("Supabase fetch error:", error);
      callback(getLocalLinks(userId));
    } else {
      const mappedLinks = (data || []).map(mapRowToLinkItem);
      callback(mappedLinks);
    }
  };

  fetchLinks();

  // Set up realtime listener
  const channel = supabase
    .channel(`links_${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: COLLECTION,
        filter: `user_id=eq.${userId}`
      },
      () => {
        // Simple approach: re-fetch on any change
        fetchLinks();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const addLinkRemote = async (userId: string, link: Omit<LinkItem, 'id'>) => {
  if (!isSupabaseConfigured) {
    const links = getLocalLinks(userId);
    const newLink = { ...link, id: Math.random().toString(36).substr(2, 9) };
    saveLocalLinks(userId, [newLink, ...links] as LinkItem[]);
    return newLink.id;
  }

  try {
    // Explicit mapping to match the SQL schema exactly (lowercase keys for PostgreSQL)
    const { data, error } = await supabase
      .from(COLLECTION)
      .insert([{
        user_id: userId,
        url: link.url,
        title: link.title,
        summary: link.summary,
        category: link.category,
        tags: link.tags,
        isread: link.isRead,       // lowercase key
        createdat: link.createdAt  // lowercase key
      }])
      .select()
      .single();

    if (error) {
      console.error("Supabase Insert Error:", error);
      throw new Error(error.message);
    }
    return data.id;
  } catch (e) {
    console.error("Error adding document to Supabase: ", e);
    throw e;
  }
};

export const updateLinkRemote = async (userId: string, linkId: string, updates: Partial<LinkItem>) => {
  if (!isSupabaseConfigured) {
    const links = getLocalLinks(userId);
    const updated = links.map(l => l.id === linkId ? { ...l, ...updates } : l);
    saveLocalLinks(userId, updated);
    return;
  }

  // Map updates: Camel -> Snake/Lowercase
  const dbUpdates: any = {};
  if (updates.isRead !== undefined) dbUpdates.isread = updates.isRead;
  if (updates.createdAt !== undefined) dbUpdates.createdat = updates.createdAt;
  if (updates.title) dbUpdates.title = updates.title;
  if (updates.summary) dbUpdates.summary = updates.summary;
  if (updates.category) dbUpdates.category = updates.category;
  if (updates.tags) dbUpdates.tags = updates.tags;

  const { error } = await supabase
    .from(COLLECTION)
    .update(dbUpdates)
    .eq('id', linkId)
    .eq('user_id', userId);

  if (error) {
    console.error("Update failed", error);
    throw error;
  }
};

export const deleteLinkRemote = async (userId: string, linkId: string) => {
  if (!isSupabaseConfigured) {
    const links = getLocalLinks(userId);
    const filtered = links.filter(l => l.id !== linkId);
    saveLocalLinks(userId, filtered);
    return;
  }

  const { error } = await supabase
    .from(COLLECTION)
    .delete()
    .eq('id', linkId)
    .eq('user_id', userId);

  if (error) console.error("Delete failed", error);
};
