\c yum_stepper_dev;

ALTER TABLE restaurants 
DROP COLUMN cusine_type;

ALTER TABLE restaurants 
ADD cuisine_type VARCHAR(250);
