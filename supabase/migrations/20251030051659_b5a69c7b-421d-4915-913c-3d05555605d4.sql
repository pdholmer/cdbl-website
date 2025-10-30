-- Add 15U Travel division if it doesn't exist
INSERT INTO public.divisions (id, name, age_range, program_id, display_order)
VALUES (
  'f8e9c1d2-3a4b-5c6d-7e8f-9a0b1c2d3e4f',
  '15U Travel',
  '15 years and under',
  '09dbe257-e659-4184-b217-fa9a15707bb5',
  8
)
ON CONFLICT (id) DO NOTHING;

-- Populate T-Ball teams (8 minor league teams)
INSERT INTO public.teams (name, program_id, division_id, season_year, status) VALUES
  ('Toledo Mud Hens', '0a379f62-be88-4f89-87fc-03e621b6e786', '7bd14492-cc57-4f2a-883e-42c1c24ef49b', 2026, 'active'),
  ('Columbus Clippers', '0a379f62-be88-4f89-87fc-03e621b6e786', '7bd14492-cc57-4f2a-883e-42c1c24ef49b', 2026, 'active'),
  ('Indianapolis Indians', '0a379f62-be88-4f89-87fc-03e621b6e786', '7bd14492-cc57-4f2a-883e-42c1c24ef49b', 2026, 'active'),
  ('Louisville Bats', '0a379f62-be88-4f89-87fc-03e621b6e786', '7bd14492-cc57-4f2a-883e-42c1c24ef49b', 2026, 'active'),
  ('Rochester Red Wings', '0a379f62-be88-4f89-87fc-03e621b6e786', '7bd14492-cc57-4f2a-883e-42c1c24ef49b', 2026, 'active'),
  ('Buffalo Bisons', '0a379f62-be88-4f89-87fc-03e621b6e786', '7bd14492-cc57-4f2a-883e-42c1c24ef49b', 2026, 'active'),
  ('Worcester Red Sox', '0a379f62-be88-4f89-87fc-03e621b6e786', '7bd14492-cc57-4f2a-883e-42c1c24ef49b', 2026, 'active'),
  ('Lehigh Valley IronPigs', '0a379f62-be88-4f89-87fc-03e621b6e786', '7bd14492-cc57-4f2a-883e-42c1c24ef49b', 2026, 'active');

-- Populate Pinto teams (10 MLB teams)
INSERT INTO public.teams (name, program_id, division_id, season_year, status) VALUES
  ('Cardinals', '0a379f62-be88-4f89-87fc-03e621b6e786', '7504d26b-fafa-46c6-a176-b454f31d5ac1', 2026, 'active'),
  ('Dodgers', '0a379f62-be88-4f89-87fc-03e621b6e786', '7504d26b-fafa-46c6-a176-b454f31d5ac1', 2026, 'active'),
  ('Yankees', '0a379f62-be88-4f89-87fc-03e621b6e786', '7504d26b-fafa-46c6-a176-b454f31d5ac1', 2026, 'active'),
  ('Red Sox', '0a379f62-be88-4f89-87fc-03e621b6e786', '7504d26b-fafa-46c6-a176-b454f31d5ac1', 2026, 'active'),
  ('Cubs', '0a379f62-be88-4f89-87fc-03e621b6e786', '7504d26b-fafa-46c6-a176-b454f31d5ac1', 2026, 'active'),
  ('Braves', '0a379f62-be88-4f89-87fc-03e621b6e786', '7504d26b-fafa-46c6-a176-b454f31d5ac1', 2026, 'active'),
  ('Giants', '0a379f62-be88-4f89-87fc-03e621b6e786', '7504d26b-fafa-46c6-a176-b454f31d5ac1', 2026, 'active'),
  ('Astros', '0a379f62-be88-4f89-87fc-03e621b6e786', '7504d26b-fafa-46c6-a176-b454f31d5ac1', 2026, 'active'),
  ('Mets', '0a379f62-be88-4f89-87fc-03e621b6e786', '7504d26b-fafa-46c6-a176-b454f31d5ac1', 2026, 'active'),
  ('Phillies', '0a379f62-be88-4f89-87fc-03e621b6e786', '7504d26b-fafa-46c6-a176-b454f31d5ac1', 2026, 'active');

-- Populate Mustang teams (10 MLB teams)
INSERT INTO public.teams (name, program_id, division_id, season_year, status) VALUES
  ('Pirates', '0a379f62-be88-4f89-87fc-03e621b6e786', '58e23371-b1cc-46ae-91a0-aab612e1d9f1', 2026, 'active'),
  ('Diamondbacks', '0a379f62-be88-4f89-87fc-03e621b6e786', '58e23371-b1cc-46ae-91a0-aab612e1d9f1', 2026, 'active'),
  ('Rockies', '0a379f62-be88-4f89-87fc-03e621b6e786', '58e23371-b1cc-46ae-91a0-aab612e1d9f1', 2026, 'active'),
  ('Marlins', '0a379f62-be88-4f89-87fc-03e621b6e786', '58e23371-b1cc-46ae-91a0-aab612e1d9f1', 2026, 'active'),
  ('Padres', '0a379f62-be88-4f89-87fc-03e621b6e786', '58e23371-b1cc-46ae-91a0-aab612e1d9f1', 2026, 'active'),
  ('Rangers', '0a379f62-be88-4f89-87fc-03e621b6e786', '58e23371-b1cc-46ae-91a0-aab612e1d9f1', 2026, 'active'),
  ('Mariners', '0a379f62-be88-4f89-87fc-03e621b6e786', '58e23371-b1cc-46ae-91a0-aab612e1d9f1', 2026, 'active'),
  ('Twins', '0a379f62-be88-4f89-87fc-03e621b6e786', '58e23371-b1cc-46ae-91a0-aab612e1d9f1', 2026, 'active'),
  ('Tigers', '0a379f62-be88-4f89-87fc-03e621b6e786', '58e23371-b1cc-46ae-91a0-aab612e1d9f1', 2026, 'active'),
  ('White Sox', '0a379f62-be88-4f89-87fc-03e621b6e786', '58e23371-b1cc-46ae-91a0-aab612e1d9f1', 2026, 'active');

-- Populate Bronco teams (10 MLB teams)
INSERT INTO public.teams (name, program_id, division_id, season_year, status) VALUES
  ('Orioles', '0a379f62-be88-4f89-87fc-03e621b6e786', 'b002ac57-0cd1-47ce-a0a3-e85a38747b9e', 2026, 'active'),
  ('Rays', '0a379f62-be88-4f89-87fc-03e621b6e786', 'b002ac57-0cd1-47ce-a0a3-e85a38747b9e', 2026, 'active'),
  ('Guardians', '0a379f62-be88-4f89-87fc-03e621b6e786', 'b002ac57-0cd1-47ce-a0a3-e85a38747b9e', 2026, 'active'),
  ('Royals', '0a379f62-be88-4f89-87fc-03e621b6e786', 'b002ac57-0cd1-47ce-a0a3-e85a38747b9e', 2026, 'active'),
  ('Angels', '0a379f62-be88-4f89-87fc-03e621b6e786', 'b002ac57-0cd1-47ce-a0a3-e85a38747b9e', 2026, 'active'),
  ('Athletics', '0a379f62-be88-4f89-87fc-03e621b6e786', 'b002ac57-0cd1-47ce-a0a3-e85a38747b9e', 2026, 'active'),
  ('Brewers', '0a379f62-be88-4f89-87fc-03e621b6e786', 'b002ac57-0cd1-47ce-a0a3-e85a38747b9e', 2026, 'active'),
  ('Reds', '0a379f62-be88-4f89-87fc-03e621b6e786', 'b002ac57-0cd1-47ce-a0a3-e85a38747b9e', 2026, 'active'),
  ('Nationals', '0a379f62-be88-4f89-87fc-03e621b6e786', 'b002ac57-0cd1-47ce-a0a3-e85a38747b9e', 2026, 'active'),
  ('Blue Jays', '0a379f62-be88-4f89-87fc-03e621b6e786', 'b002ac57-0cd1-47ce-a0a3-e85a38747b9e', 2026, 'active');

-- Populate Pony teams (8 MLB teams)
INSERT INTO public.teams (name, program_id, division_id, season_year, status) VALUES
  ('Cardinals', '0a379f62-be88-4f89-87fc-03e621b6e786', '177da936-eb75-4eea-95a4-7187c4c0a48c', 2026, 'active'),
  ('Dodgers', '0a379f62-be88-4f89-87fc-03e621b6e786', '177da936-eb75-4eea-95a4-7187c4c0a48c', 2026, 'active'),
  ('Yankees', '0a379f62-be88-4f89-87fc-03e621b6e786', '177da936-eb75-4eea-95a4-7187c4c0a48c', 2026, 'active'),
  ('Cubs', '0a379f62-be88-4f89-87fc-03e621b6e786', '177da936-eb75-4eea-95a4-7187c4c0a48c', 2026, 'active'),
  ('Red Sox', '0a379f62-be88-4f89-87fc-03e621b6e786', '177da936-eb75-4eea-95a4-7187c4c0a48c', 2026, 'active'),
  ('Giants', '0a379f62-be88-4f89-87fc-03e621b6e786', '177da936-eb75-4eea-95a4-7187c4c0a48c', 2026, 'active'),
  ('Braves', '0a379f62-be88-4f89-87fc-03e621b6e786', '177da936-eb75-4eea-95a4-7187c4c0a48c', 2026, 'active'),
  ('Astros', '0a379f62-be88-4f89-87fc-03e621b6e786', '177da936-eb75-4eea-95a4-7187c4c0a48c', 2026, 'active');

-- Populate Travel teams
INSERT INTO public.teams (name, program_id, division_id, season_year, status) VALUES
  ('8U Blue', '09dbe257-e659-4184-b217-fa9a15707bb5', 'dbec9d5a-8370-45e4-8583-bf5b4ac8eaf8', 2026, 'active'),
  ('9U Blue', '09dbe257-e659-4184-b217-fa9a15707bb5', '4a3178c6-e081-4dac-ba4d-3945e2bf79c8', 2026, 'active'),
  ('10U Blue', '09dbe257-e659-4184-b217-fa9a15707bb5', '76a1817a-177e-4147-bb7e-cd98080c4d76', 2026, 'active'),
  ('10U White', '09dbe257-e659-4184-b217-fa9a15707bb5', '76a1817a-177e-4147-bb7e-cd98080c4d76', 2026, 'active'),
  ('10U Gray', '09dbe257-e659-4184-b217-fa9a15707bb5', '76a1817a-177e-4147-bb7e-cd98080c4d76', 2026, 'active'),
  ('11U Blue', '09dbe257-e659-4184-b217-fa9a15707bb5', '88e20c2b-e67b-4094-8b42-7e1cd6da8f5d', 2026, 'active'),
  ('11U White', '09dbe257-e659-4184-b217-fa9a15707bb5', '88e20c2b-e67b-4094-8b42-7e1cd6da8f5d', 2026, 'active'),
  ('12U Blue', '09dbe257-e659-4184-b217-fa9a15707bb5', '7fd0e9c8-1971-49b1-8d33-dcef6fc083e2', 2026, 'active'),
  ('12U White', '09dbe257-e659-4184-b217-fa9a15707bb5', '7fd0e9c8-1971-49b1-8d33-dcef6fc083e2', 2026, 'active'),
  ('13U Blue', '09dbe257-e659-4184-b217-fa9a15707bb5', '2486b6f3-964b-439b-a804-e0edecae2471', 2026, 'active'),
  ('14U Blue', '09dbe257-e659-4184-b217-fa9a15707bb5', '24ebbdf3-b4b7-42c0-b5f8-157852d0240e', 2026, 'active'),
  ('14U White', '09dbe257-e659-4184-b217-fa9a15707bb5', '24ebbdf3-b4b7-42c0-b5f8-157852d0240e', 2026, 'active'),
  ('15U Travel', '09dbe257-e659-4184-b217-fa9a15707bb5', 'f8e9c1d2-3a4b-5c6d-7e8f-9a0b1c2d3e4f', 2026, 'active');