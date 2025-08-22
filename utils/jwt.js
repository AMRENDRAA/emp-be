const jwt=require('jsonwebtoken');

function signAccessToken(payload ){

    const secret=process.env.JWT_ACCESS_SECRET;
    const ttl=process.env.ACCESS_TTL||'15m';
    return jwt.sign(payload,secret,{expiresIn:ttl});

}


function verifyAccessToken(Token){
    try{
        return jwt.verify(token ,process.env.JWT_ACCESS_SECRET);

    }catch(err){
        return null ;
    }
}



module.exports={signAccessToken,verifyAccessToken};

