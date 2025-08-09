const Employee=require('../models/Employee');

exports.getAllEmployees= async (req,res)=>{
    try{

        
        const employees= await Employee.findAll();
        res.status(200).json({
            status:"success",
            data:employees
        })
    }catch(err){
        console.error('error',err);
        res.status(500).json({
            status:"error",
            message:err.message
        })
    }
}

exports.createEmployee= async (req,res)=>{

    const{ name ,email,position}=req.body;
    try{
        console.error(name,email,position);

        const newemployee=await Employee.create({name ,email,position});
        res.status(201).json({
            status:"success",
            data:newemployee
        })

    }catch(err){
        console.log('errr');
        res.status(500).json({
            status:"Failed",
            err:err.message
        })
    }

}

exports.updateemployee=async (req,res)=>{

    const{id}=req.params;
    const {name ,email,position}=req.body;

    try{

        const employee= await Employee.findByPk(id);
        if(!employee){
            res.status(404).json({
                status:"Not found",
                message:"Not found"
            })
        }

        await employee.update({name,email,position});
        res.status(200).json({
            status:"Success",
            data:employee
        })
    }catch(err){
        res.status(400).json({
            status:"Failed ",
            message:err.message
        })

    }
}


exports.getemployeebyId= async(req,res)=>{
    const {id}=req.params;
    try{
        const employee= await Employee.findByPk(id);
        if(!employee){
            return res.status(404).json({err:'Employee not found '})
        }

        res.status(200).json({
            status:'success',
            data:employee
        })
    }catch(err)
    {
        res.status(500).json({
            error:'err in fetching',
            err:err.err
        })
    }
}


exports.deleteemployee =async(req,res)=>{

    try{
        const {id}=req.params;
        const employee= await Employee.findByPk(id);
        if(!employee){
            res.status(404).json({
                error:'employee not found',
                
            })


        }

        await employee.destroy();

        return res.status(200).json({
                  status: 'Success',
            message: 'Employee deleted successfully',

        })
    }catch(err){
        res.status(500).json({
            status:'Failed',
            err:err.err
        })
    }
}