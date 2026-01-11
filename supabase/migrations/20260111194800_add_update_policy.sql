-- Allow authenticated users to update filters (needed for seeding duplicates/upserts)
CREATE POLICY "Authenticated update filters" ON filter_definitions
  FOR UPDATE USING (auth.role() = 'authenticated');
