-- Create filter_definitions table
CREATE TABLE filter_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL CHECK (section IN ('category', 'screen', 'ui_element', 'flow')),
  group_name text, -- e.g. "New User Experience", can be null for top-level like Categories
  name text NOT NULL, -- e.g. "Signup"
  slug text NOT NULL UNIQUE, -- e.g. "signup"
  definition text, -- description from Mobbin
  synonyms text[], -- synonyms for search
  created_at timestamptz DEFAULT now()
);

-- Create junction table for components <-> filters
CREATE TABLE component_filters (
  component_id bigint REFERENCES components(id) ON DELETE CASCADE,
  filter_id uuid REFERENCES filter_definitions(id) ON DELETE CASCADE,
  PRIMARY KEY (component_id, filter_id)
);

-- Index for faster filtering
CREATE INDEX idx_component_filters_filter_id ON component_filters(filter_id);
CREATE INDEX idx_component_filters_component_id ON component_filters(component_id);
CREATE INDEX idx_filter_definitions_section ON filter_definitions(section);
CREATE INDEX idx_filter_definitions_slug ON filter_definitions(slug);

-- Enable RLS
ALTER TABLE filter_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_filters ENABLE ROW LEVEL SECURITY;

-- Policies (Public Read, Authenticated Write/Admin)
CREATE POLICY "Public read filters" ON filter_definitions
  FOR SELECT USING (true);

CREATE POLICY "Public read component_filters" ON component_filters
  FOR SELECT USING (true);

CREATE POLICY "Authenticated insert filters" ON filter_definitions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated insert component_filters" ON component_filters
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete component_filters" ON component_filters
  FOR DELETE USING (auth.role() = 'authenticated');
