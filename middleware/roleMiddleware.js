function requireRoles(...allowedRoles){

return (req,res,next)=>{


    if(!req.user){
        return res.status(401).json({
            status:"error",
            message:"unauthenticated"
        })
    }


    if(allowedRoles.includes(req.user.role)) return next();

    return res.status(403).json({
        status:"Error",
        message:"forbidden "
    })
}
}


function requireSelfOrRoles(paramKey, ...allowedRoles){

    return (req,res,next)=>{
        if(!req.user){
            return res.status(401).json({
                status:"error",
                message:"Unauthenticated "
            })
        }
    }

    if(req.user.id===req.params[paramKey])return next();
    if(allowedRoles.includes(req.user.role))return next();
    return res.status(403).json({
        status:"error",
        message:"Forbidden"
    })

}


module.exports={requireRoles,requireSelfOrRoles};
