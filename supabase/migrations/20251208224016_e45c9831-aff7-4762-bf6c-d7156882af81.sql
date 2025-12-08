
INSERT INTO simulation_configs_variables (
  account_num, name, id_proj, id_lang, id_lob, id_sim_cfg, 
  calculation_type, formula, value_type, data_origin, page_name, 
  level, row_index, blocked, parent_account_id
)
VALUES 
  ('1.102030501', 'Fixed Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 
   'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 170, true, '3700c8cf-7e26-424f-a9a5-bfd120f34e12'),
  ('1.102030502', 'Produtivity Bonus h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 
   'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 171, true, '3700c8cf-7e26-424f-a9a5-bfd120f34e12'),
  ('1.102030503', 'Other Variable Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 
   'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 172, true, '3700c8cf-7e26-424f-a9a5-bfd120f34e12'),
  ('1.102030504', 'NightShift/h', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 
   'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 173, true, '3700c8cf-7e26-424f-a9a5-bfd120f34e12'),
  ('1.102030505', 'Housing Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 
   'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 174, true, '3700c8cf-7e26-424f-a9a5-bfd120f34e12'),
  ('1.102030506', 'Total Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 
   'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 175, true, '3700c8cf-7e26-424f-a9a5-bfd120f34e12');
