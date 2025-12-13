
-- Duplicar contas filhas de 1.10202 para a nova conta pai 1.3000 com id_lob = null
INSERT INTO simulation_configs_variables (
  name, data_origin, page_name, id_lob, row_index, id_sim_cfg, blocked, 
  parent_account_id, level, id_lang, id_proj, account_num, value_type, 
  formula, calculation_type
)
VALUES
  -- 1.1020201 -> 1.300001
  ('Monthly hours per FTE', NULL, 'Net Sales', NULL, 27, '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', true, 
   '14a821ff-ffff-4292-ae11-71e46402a696', 4, 'PT', 'PRJ01', '1.300001', 'number', NULL, 'FORMULA'),
  -- 1.1020202 -> 1.300002
  ('HC Start', NULL, 'Net Sales', NULL, 28, '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', true, 
   '14a821ff-ffff-4292-ae11-71e46402a696', 4, 'PT', 'PRJ01', '1.300002', 'number', '[1.1020107]-[1.1020108]', 'FORMULA'),
  -- 1.1020203 -> 1.300003
  ('HC End', NULL, 'Net Sales', NULL, 29, '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', true, 
   '14a821ff-ffff-4292-ae11-71e46402a696', 4, 'PT', 'PRJ01', '1.300003', 'number', NULL, 'FORMULA'),
  -- 1.1020204 -> 1.300004
  ('AVG HC', NULL, 'Net Sales', NULL, 30, '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', true, 
   '14a821ff-ffff-4292-ae11-71e46402a696', 4, 'PT', 'PRJ01', '1.300004', 'number', 'AVG([1.1020202],[1.1020203])', 'FORMULA'),
  -- 1.1020205 -> 1.300005
  ('HC Start Production', NULL, 'Net Sales', NULL, 31, '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', true, 
   '14a821ff-ffff-4292-ae11-71e46402a696', 4, 'PT', 'PRJ01', '1.300005', 'number', '[1.1020202]', 'FORMULA'),
  -- 1.1020206 -> 1.300006
  ('HC End Production', NULL, 'Net Sales', NULL, 33, '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', true, 
   '14a821ff-ffff-4292-ae11-71e46402a696', 4, 'PT', 'PRJ01', '1.300006', 'number', '[1.1020203]', 'FORMULA'),
  -- 1.1020207 -> 1.300007
  ('AVG HC Production', NULL, 'Net Sales', NULL, 34, '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', true, 
   '14a821ff-ffff-4292-ae11-71e46402a696', 4, 'PT', 'PRJ01', '1.300007', 'number', 'AVG([1.1020205], [1.1020206])', 'FORMULA'),
  -- 1.1020208 -> 1.300008
  ('Hours/HC', NULL, 'Net Sales', NULL, 35, '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', true, 
   '14a821ff-ffff-4292-ae11-71e46402a696', 4, 'PT', 'PRJ01', '1.300008', 'number', '[1.1]', 'FORMULA'),
  -- 1.1020209 -> 1.300009
  ('Hired Hours', NULL, 'Net Sales', NULL, 36, '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', true, 
   '14a821ff-ffff-4292-ae11-71e46402a696', 4, 'PT', 'PRJ01', '1.300009', 'number', NULL, 'FORMULA'),
  -- 1.1020210 -> 1.3000010
  ('New Hires(HRMS)', NULL, 'Net Sales', NULL, 37, '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', true, 
   '14a821ff-ffff-4292-ae11-71e46402a696', 4, 'PT', 'PRJ01', '1.3000010', 'number', NULL, 'FORMULA'),
  -- 1.1020211 -> 1.3000011
  ('New Hires worked hours ( HRMS)', NULL, 'Net Sales', NULL, 38, '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', true, 
   '14a821ff-ffff-4292-ae11-71e46402a696', 4, 'PT', 'PRJ01', '1.3000011', 'number', NULL, 'FORMULA'),
  -- 1.1020212 -> 1.3000012
  ('Recruited hours', NULL, 'Net Sales', NULL, 39, '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', true, 
   '14a821ff-ffff-4292-ae11-71e46402a696', 4, 'PT', 'PRJ01', '1.3000012', 'number', NULL, 'FORMULA');
