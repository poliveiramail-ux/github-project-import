
INSERT INTO simulation_configs_variables (
  account_num, name, id_proj, id_lang, id_lob, id_sim_cfg, 
  calculation_type, formula, value_type, data_origin, page_name, 
  level, row_index, blocked, parent_account_id
)
VALUES 
  -- 1.1020307 (Accounts)
  ('1.102030701', 'Fixed Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 182, true, '98545b49-bb91-4297-a238-38eb086c3d96'),
  ('1.102030702', 'Produtivity Bonus h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 183, true, '98545b49-bb91-4297-a238-38eb086c3d96'),
  ('1.102030703', 'Other Variable Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 184, true, '98545b49-bb91-4297-a238-38eb086c3d96'),
  ('1.102030704', 'NightShift/h', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 185, true, '98545b49-bb91-4297-a238-38eb086c3d96'),
  ('1.102030705', 'Housing Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 186, true, '98545b49-bb91-4297-a238-38eb086c3d96'),
  ('1.102030706', 'Total Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 187, true, '98545b49-bb91-4297-a238-38eb086c3d96'),
  
  -- 1.1020308 (Mission Control)
  ('1.102030801', 'Fixed Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 188, true, 'b261509f-d4c5-4b3a-957d-b10aecbdb79d'),
  ('1.102030802', 'Produtivity Bonus h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 189, true, 'b261509f-d4c5-4b3a-957d-b10aecbdb79d'),
  ('1.102030803', 'Other Variable Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 190, true, 'b261509f-d4c5-4b3a-957d-b10aecbdb79d'),
  ('1.102030804', 'NightShift/h', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 191, true, 'b261509f-d4c5-4b3a-957d-b10aecbdb79d'),
  ('1.102030805', 'Housing Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 192, true, 'b261509f-d4c5-4b3a-957d-b10aecbdb79d'),
  ('1.102030806', 'Total Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 193, true, 'b261509f-d4c5-4b3a-957d-b10aecbdb79d'),
  
  -- 1.1020309 (B.Analyst)
  ('1.102030901', 'Fixed Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 194, true, '90ce45d4-f6e4-419d-9ce3-d57400b9fa1b'),
  ('1.102030902', 'Produtivity Bonus h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 195, true, '90ce45d4-f6e4-419d-9ce3-d57400b9fa1b'),
  ('1.102030903', 'Other Variable Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 196, true, '90ce45d4-f6e4-419d-9ce3-d57400b9fa1b'),
  ('1.102030904', 'NightShift/h', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 197, true, '90ce45d4-f6e4-419d-9ce3-d57400b9fa1b'),
  ('1.102030905', 'Housing Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 198, true, '90ce45d4-f6e4-419d-9ce3-d57400b9fa1b'),
  ('1.102030906', 'Total Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 199, true, '90ce45d4-f6e4-419d-9ce3-d57400b9fa1b'),
  
  -- 1.1020310 (Sales Valida.)
  ('1.102031001', 'Fixed Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 200, true, '9935800f-44fc-4100-a80d-774b9c3d80e6'),
  ('1.102031002', 'Produtivity Bonus h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 201, true, '9935800f-44fc-4100-a80d-774b9c3d80e6'),
  ('1.102031003', 'Other Variable Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 202, true, '9935800f-44fc-4100-a80d-774b9c3d80e6'),
  ('1.102031004', 'NightShift/h', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 203, true, '9935800f-44fc-4100-a80d-774b9c3d80e6'),
  ('1.102031005', 'Housing Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 204, true, '9935800f-44fc-4100-a80d-774b9c3d80e6'),
  ('1.102031006', 'Total Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 205, true, '9935800f-44fc-4100-a80d-774b9c3d80e6'),
  
  -- 1.1020311 (RPA)
  ('1.102031101', 'Fixed Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 206, true, '54cd339f-8862-4655-a41f-0c5811bc9ed0'),
  ('1.102031102', 'Produtivity Bonus h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 207, true, '54cd339f-8862-4655-a41f-0c5811bc9ed0'),
  ('1.102031103', 'Other Variable Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 208, true, '54cd339f-8862-4655-a41f-0c5811bc9ed0'),
  ('1.102031104', 'NightShift/h', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 209, true, '54cd339f-8862-4655-a41f-0c5811bc9ed0'),
  ('1.102031105', 'Housing Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 210, true, '54cd339f-8862-4655-a41f-0c5811bc9ed0'),
  ('1.102031106', 'Total Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 211, true, '54cd339f-8862-4655-a41f-0c5811bc9ed0'),
  
  -- 1.1020312 (SME)
  ('1.102031201', 'Fixed Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 212, true, 'd34b8332-c2ec-4293-9e52-a2c9f2a192ba'),
  ('1.102031202', 'Produtivity Bonus h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 213, true, 'd34b8332-c2ec-4293-9e52-a2c9f2a192ba'),
  ('1.102031203', 'Other Variable Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 214, true, 'd34b8332-c2ec-4293-9e52-a2c9f2a192ba'),
  ('1.102031204', 'NightShift/h', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 215, true, 'd34b8332-c2ec-4293-9e52-a2c9f2a192ba'),
  ('1.102031205', 'Housing Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 216, true, 'd34b8332-c2ec-4293-9e52-a2c9f2a192ba'),
  ('1.102031206', 'Total Cost h/', 'PRJ01', 'PT', 'LOB01', '3ab6e6c2-d7bc-42aa-a631-45b851b18f84', 'MANUAL', NULL, 'number', NULL, 'CostOfSales', 5, 217, true, 'd34b8332-c2ec-4293-9e52-a2c9f2a192ba');
