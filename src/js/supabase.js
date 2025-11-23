import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// NOTE: These should be environment variables in a real build process.
// For now, we will use placeholders or expect them to be injected.
const SUPABASE_URL = 'https://rpbxwqzcvfrfgzdipsra.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwYnh3cXpjdmZyZmd6ZGlwc3JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NzUwMjQsImV4cCI6MjA3OTQ1MTAyNH0.nlJC8haFluvSOIECgkLZuoefWLBn5UowgzAdnR6Uays';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function getProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (error) console.error('Error fetching profile:', error);
    return data;
}
