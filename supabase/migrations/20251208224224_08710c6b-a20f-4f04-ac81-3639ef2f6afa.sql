
INSERT INTO simulation_configs_variables (
  account_num, name, id_proj, id_lang, id_lob, id_sim_cfg, 
  calculation_type, formula, value_type, data_origin, page_name, 
  level, row_index, blocked, parent_account_id
)
VALUES 
  ('1.102030601', 'Fixed Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 
   'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 176, true, '0788cdf2-3cc2-49f2-941c-b71fff76d9e3'),
  ('1.102030602', 'Produtivity Bonus h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 
   'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 177, true, '0788cdf2-3cc2-49f2-941c-b71fff76d9e3'),
  ('1.102030603', 'Other Variable Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 
   'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 178, true, '0788cdf2-3cc2-49f2-941c-b71fff76d9e3'),
  ('1.102030604', 'NightShift/h', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 
   'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 179, true, '0788cdf2-3cc2-49f2-941c-b71fff76d9e3'),
  ('1.102030605', 'Housing Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 
   'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 180, true, '0788cdf2-3cc2-49f2-941c-b71fff76d9e3'),
  ('1.102030606', 'Total Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 
   'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 181, true, '0788cdf2-3cc2-49f2-941c-b71fff76d9e3');
