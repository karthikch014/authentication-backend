import jwt from 'jsonwebtoken';

export const verifyToken = async(req,res,next) =>{

    try {

        const token = req.cookies.token;

        if(!token){
            return res.json({success:false,message:"invalid token. Login again"});
        }

        jwt.verify(token,process.env.JWT_SECRET, (err,decoded)=>{
            if(err){
                return res.json({success:false,message:"Invalid token"})
            }
            req.userId = decoded.id;
            next();
        })

    } catch (error) {
        return res.json({success:false,message:"Server error"});
    }

    
}
