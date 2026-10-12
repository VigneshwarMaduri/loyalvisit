import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ibwzleuccuydqozzsvbr.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_H-1cInOQy-F-AKU1SNLXsQ_JjejMaDq';

export const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
