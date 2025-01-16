
// import { createClient } from '@supabase/supabase-js';
const { createClient } = require('@supabase/supabase-js');


const supabaseUrl = 'https://qtpcpnopgqtdajuwynpi.supabase.co' ;
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0cGNwbm9wZ3F0ZGFqdXd5bnBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0MTk3NDUsImV4cCI6MjA1MTk5NTc0NX0.744NXaEQqtWrs3r1T9LyueXLnI5Z_1yqrrUixTmXT_g' ;
const supabase = createClient(supabaseUrl, supabaseKey)

module.exports = supabase ;