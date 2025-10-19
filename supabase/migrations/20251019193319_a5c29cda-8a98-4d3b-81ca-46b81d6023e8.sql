
-- Copy all simulation_configs_variables from LOB01 to LOB2
INSERT INTO public.simulation_configs_variables 
  (account_num, name, calculation_type, formula, value_type, row_index, blocked, id_sim_cfg, id_proj, id_lang, id_lob)
SELECT 
  account_num, 
  name, 
  calculation_type, 
  formula, 
  value_type, 
  row_index, 
  blocked, 
  id_sim_cfg, 
  id_proj, 
  id_lang, 
  'LOB2' as id_lob
FROM public.simulation_configs_variables
WHERE id_proj = 'PRJ01' 
  AND id_lang = 'PT' 
  AND id_lob = 'LOB01';
