\c yum_stepper_dev;

ALTER TABLE restaurants 
DROP COLUMN IF EXISTS cuisine_type;

ALTER TABLE restaurants 
ADD COLUMN cuisine_type VARCHAR(250);



