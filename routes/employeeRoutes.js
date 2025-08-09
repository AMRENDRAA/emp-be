const express=require('express');
const router= express.Router();
const employeeController=require('../controller/Employee');
router.get('/',employeeController.getAllEmployees);
router.post('/',employeeController.createEmployee);
router.get('/:id',employeeController.getemployeebyId);
router.put('/:id',employeeController.updateemployee);
// router.get('/:id',employeeController.getemployeebyId);
router.delete('/:id',employeeController.deleteemployee);

module.exports=router;
