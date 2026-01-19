import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Helper to slugify
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');

// Helper to load env vars manually since we don't have dotenv
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) return {};
    
    const content = fs.readFileSync(envPath, 'utf-8');
    const env = {};
    content.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        let value = match[2].trim();
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        env[match[1].trim()] = value;
      }
    });
    return env;
  } catch (e) {
    console.error('Error loading .env.local:', e);
    return {};
  }
}

async function seed() {
  console.log('Starting seed...');
  
  const env = loadEnv();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  // Try to find service role key for admin access (bypass RLS)
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
  }
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('WARNING: using ANON key. RLS may block inserts if not authenticated.');
  } else {
      console.log('Using Service Role Key (Admin Mode)');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const filePath = path.join(process.cwd(), 'filters.md');
  console.log('Reading filters from:', filePath);

  if (!fs.existsSync(filePath)) {
      console.error('filters.md not found');
      process.exit(1);
  }
  
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n');
  
  let currentSection = null;
  let currentGroup = null;
  const results = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect Section (H2)
    if (trimmed.startsWith('## ')) {
      const header = trimmed.replace('## ', '').trim();
      if (header === 'Categories') currentSection = 'category';
      else if (header === 'Screens') currentSection = 'screen';
      else if (header === 'UI Elements') currentSection = 'ui_element';
      else if (header === 'Flows') currentSection = 'flow';
      
      currentGroup = null; // Reset group on new section
      continue;
    }

    // Detect Group (H3)
    if (trimmed.startsWith('### ')) {
      currentGroup = trimmed.replace('### ', '').trim();
      continue;
    }

    // Detect Item (List)
    if (trimmed.startsWith('- ')) {
      if (!currentSection) continue;
      
      const name = trimmed.replace('- ', '').trim();
      const slug = slugify(name);

      const payload = {
        section: currentSection,
        group_name: currentGroup,
        name,
        slug,
      };

      const { error } = await supabase
        .from('filter_definitions')
        .upsert(payload, { onConflict: 'slug' });

      if (error) {
        console.error('Error inserting', name, error.message);
        results.push({ status: 'error', name, error: error.message });
      } else {
        process.stdout.write('.'); // Progress dot
        results.push({ status: 'ok', name });
      }
    }
  }

  console.log('\nSeeding complete!');
  console.log('Total:', results.length);
  console.log('Success:', results.filter(r => r.status === 'ok').length);
  console.log('Errors:', results.filter(r => r.status === 'error').length);
}

seed();
