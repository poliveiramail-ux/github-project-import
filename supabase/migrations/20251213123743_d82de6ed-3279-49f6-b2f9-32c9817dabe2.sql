
-- Duplicar contas filhas de 1.10203 para a nova conta pai 1.2000 com id_lob = null
INSERT INTO simulation_configs_variables (
  name, data_origin, page_name, id_lob, row_index, id_sim_cfg, blocked, 
  parent_account_id, level, id_lang, id_proj, account_num, value_type, 
  formula, calculation_type
)
VALUES
  -- 1.1020301 -> 1.200001
  ('CSRs', NULL, 'CostOfSales', NULL, 54, '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', true, 
   'dc63ee79-9109-4216-950a-eb044ecbbeeb', 4, 'PT', 'PRJ01', '1.200001', 'number', NULL, 'FORMULA'),
  -- 1.1020302 -> 1.200002
  ('Management Racio', NULL, 'CostOfSales', NULL, 55, '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', true, 
   'dc63ee79-9109-4216-950a-eb044ecbbeeb', 4, 'PT', 'PRJ01', '1.200002', 'number', NULL, 'FORMULA'),
  -- 1.1020303 -> 1.200003
  ('Supervisors', NULL, 'CostOfSales', NULL, 56, '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', true, 
   'dc63ee79-9109-4216-950a-eb044ecbbeeb', 4, 'PT', 'PRJ01', '1.200003', 'number', NULL, 'FORMULA'),
  -- 1.1020304 -> 1.200004
  ('ACMs', NULL, 'CostOfSales', NULL, 57, '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', true, 
   'dc63ee79-9109-4216-950a-eb044ecbbeeb', 4, 'PT', 'PRJ01', '1.200004', 'number', NULL, 'FORMULA'),
  -- 1.1020305 -> 1.200005
  ('Quality', NULL, 'CostOfSales', NULL, 64, '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', true, 
   'dc63ee79-9109-4216-950a-eb044ecbbeeb', 4, 'PT', 'PRJ01', '1.200005', 'number', NULL, 'FORMULA'),
  -- 1.1020306 -> 1.200006
  ('Trainers', NULL, 'CostOfSales', NULL, 65, '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', true, 
   'dc63ee79-9109-4216-950a-eb044ecbbeeb', 4, 'PT', 'PRJ01', '1.200006', 'number', NULL, 'FORMULA'),
  -- 1.1020307 -> 1.200007
  ('Accounts', NULL, 'CostOfSales', NULL, 0, '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', true, 
   'dc63ee79-9109-4216-950a-eb044ecbbeeb', 4, 'PT', 'PRJ01', '1.200007', 'number', NULL, 'FORMULA'),
  -- 1.1020308 -> 1.200008
  ('Mission Control', NULL, 'CostOfSales', NULL, 0, '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', true, 
   'dc63ee79-9109-4216-950a-eb044ecbbeeb', 4, 'PT', 'PRJ01', '1.200008', 'number', NULL, 'FORMULA'),
  -- 1.1020309 -> 1.200009
  ('B.Analyst', NULL, 'CostOfSales', NULL, 0, '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', true, 
   'dc63ee79-9109-4216-950a-eb044ecbbeeb', 4, 'PT', 'PRJ01', '1.200009', 'number', NULL, 'FORMULA'),
  -- 1.1020310 -> 1.2000010
  ('Sales Valida.', NULL, 'CostOfSales', NULL, 0, '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', true, 
   'dc63ee79-9109-4216-950a-eb044ecbbeeb', 4, 'PT', 'PRJ01', '1.2000010', 'number', NULL, 'FORMULA'),
  -- 1.1020311 -> 1.2000011
  ('RPA', NULL, 'CostOfSales', NULL, 0, '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', true, 
   'dc63ee79-9109-4216-950a-eb044ecbbeeb', 4, 'PT', 'PRJ01', '1.2000011', 'number', NULL, 'FORMULA'),
  -- 1.1020312 -> 1.2000012
  ('SME', NULL, 'CostOfSales', NULL, 0, '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', true, 
   'dc63ee79-9109-4216-950a-eb044ecbbeeb', 4, 'PT', 'PRJ01', '1.2000012', 'number', NULL, 'FORMULA');
