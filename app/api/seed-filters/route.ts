
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Helper to slugify
const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Debug: Log path
    const filePath = path.join(process.cwd(), 'filters.md');
    console.log('Reading filters from:', filePath);

    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: 'filters.md not found at ' + filePath }, { status: 404 });
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    const lines = fileContent.split('\n');
    let currentSection: 'category' | 'screen' | 'ui_element' | 'flow' | null = null;
    let currentGroup: string | null = null;

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
        if (!currentSection) continue; // Skip initial list in file if any
        
        const name = trimmed.replace('- ', '').trim();
        const slug = slugify(name);

        // Insert into DB
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
          console.error('Error inserting', name, error);
          results.push({ status: 'error', name, error: error.message });
        } else {
          results.push({ status: 'ok', name });
        }
      }
    }

    return NextResponse.json({
      message: 'Seeding complete',
      stats: {
          total: results.length,
          success: results.filter(r => r.status === 'ok').length,
          errors: results.filter(r => r.status === 'error').length
      },
      results
    });
  } catch (error: any) {
    console.error('Seed filters error:', error);
    return NextResponse.json({ 
        error: 'Internal Server Error', 
        details: error.message,
        stack: error.stack 
    }, { status: 500 });
  }
}
