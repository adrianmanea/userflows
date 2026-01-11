-- Make code_string nullable since we support external URLs and uploaded files now
ALTER TABLE components ALTER COLUMN code_string DROP NOT NULL;
