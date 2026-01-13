-- Allow authenticated users to delete content
-- This complements the "relax_rls" migration which allowed insert/update

-- 1. Components
DROP POLICY IF EXISTS "Components are deletable by admins only" ON components;
CREATE POLICY "Components are deletable by authenticated users" ON components FOR DELETE USING (auth.role() = 'authenticated');

-- 2. Flows
DROP POLICY IF EXISTS "Flows are deletable by admins only" ON flows;
CREATE POLICY "Flows are deletable by authenticated users" ON flows FOR DELETE USING (auth.role() = 'authenticated');

-- 3. Flow Steps
DROP POLICY IF EXISTS "Flow Steps are deletable by admins only" ON flow_steps;
CREATE POLICY "Flow Steps are deletable by authenticated users" ON flow_steps FOR DELETE USING (auth.role() = 'authenticated');
