import { connection, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  await connection();
  try {
    const supabase = await createServerSupabaseClient();
    const { data: schools, error } = await supabase
      .from('schools')
      .select('id, name, short_name, city, state')
      .order('name')
      .limit(2000);

    if (error) {
      console.error('Public school directory query failed:', error.message);
      return NextResponse.json({ error: 'Could not load the school directory.' }, { status: 500 });
    }

    return NextResponse.json({ schools: schools ?? [] });
  } catch (error) {
    console.error('School directory request failed:', error);
    return NextResponse.json({ error: 'Could not process the school directory request.' }, { status: 500 });
  }
}
