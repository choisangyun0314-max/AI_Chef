import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Supabase credentials missing on server' }, { status: 500 })
    }

    // Initialize with service role key to bypass RLS securely on server-side
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabaseClient
      .from('ingredients')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      console.error('API Error fetching ingredients:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('API Server Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
