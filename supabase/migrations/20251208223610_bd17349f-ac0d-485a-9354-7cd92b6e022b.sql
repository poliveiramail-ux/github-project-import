
-- Duplicar registos filhos de 1.1020301 para o novo pai 1.1020303
-- Substituir '1.1020301' por '1.1020303' no account_num

INSERT INTO simulation_configs_variables (
  account_num, name, id_proj, id_lang, id_lob, id_sim_cfg, 
  calculation_type, formula, value_type, data_origin, page_name, 
  level, row_index, blocked, parent_account_id
)
VALUES 
  ('1.102030301', 'Fixed Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 
   'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 158, true, '1840dc4b-dfc1-44cf-85b4-90ec46d116b3'),
  ('1.102030302', 'Produtivity Bonus h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 
   'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 159, true, '1840dc4b-dfc1-44cf-85b4-90ec46d116b3'),
  ('1.102030303', 'Other Variable Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 
   'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 160, true, '1840dc4b-dfc1-44cf-85b4-90ec46d116b3'),
  ('1.102030304', 'NightShift/h', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 
   'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 161, true, '1840dc4b-dfc1-44cf-85b4-90ec46d116b3'),
  ('1.102030305', 'Housing Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 
   'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 162, true, '1840dc4b-dfc1-44cf-85b4-90ec46d116b3'),
  ('1.102030306', 'Total Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 
   'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 163, true, '1840dc4b-dfc1-44cf-85b4-90ec46d116b3');
