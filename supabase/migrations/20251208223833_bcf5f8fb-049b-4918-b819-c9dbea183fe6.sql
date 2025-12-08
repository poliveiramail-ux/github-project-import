
INSERT INTO simulation_configs_variables (
  account_num, name, id_proj, id_lang, id_lob, id_sim_cfg, 
  calculation_type, formula, value_type, data_origin, page_name, 
  level, row_index, blocked, parent_account_id
)
VALUES 
  ('1.102030401', 'Fixed Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 
   'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 164, true, '6eb29299-a4e8-412f-affa-47472aafde18'),
  ('1.102030402', 'Produtivity Bonus h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 
   'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 165, true, '6eb29299-a4e8-412f-affa-47472aafde18'),
  ('1.102030403', 'Other Variable Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 
   'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 166, true, '6eb29299-a4e8-412f-affa-47472aafde18'),
  ('1.102030404', 'NightShift/h', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 
   'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 167, true, '6eb29299-a4e8-412f-affa-47472aafde18'),
  ('1.102030405', 'Housing Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 
   'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 168, true, '6eb29299-a4e8-412f-affa-47472aafde18'),
  ('1.102030406', 'Total Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 
   'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 169, true, '6eb29299-a4e8-412f-affa-47472aafde18');
