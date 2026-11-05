import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contacts } = await req.json();
    if (!Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json({ registeredContacts: [] });
    }

    const emails = contacts.map((c: any) => c.email).filter(Boolean);
    const phones = contacts.map((c: any) => c.phone?.replace(/\D/g, '')).filter(Boolean);

    let query = supabase
      .from('users')
      .select('id, full_name, username, avatar_url, email, phone, department')
      .neq('id', user.id);

    if (emails.length > 0 || phones.length > 0) {
      const conditions = [];
      if (emails.length > 0) conditions.push(`email.in.(${emails.join(',')})`);
      if (phones.length > 0) conditions.push(`phone.in.(${phones.join(',')})`);
      query = query.or(conditions.join(','));
    } else {
      return NextResponse.json({ registeredContacts: [] });
    }

    const { data: matchedUsers, error } = await query;
    if (error) throw error;

    return NextResponse.json({ registeredContacts: matchedUsers || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Something went wrong' }, { status: 500 });
  }
}