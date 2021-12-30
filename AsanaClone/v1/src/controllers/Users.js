const {insert,list,loginUser} = require("../services/Users")
const httpStatus = require("http-status")
const {passwordToHash, generateAccesToken, generaterRefreshToken} =require("../scripts/utils/helper")
 
const create = (req,res)=>{  
    
    req.body.password= passwordToHash(req.body.password)
 
    insert(req.body)
     
    .then((response)=>{
        res.status(httpStatus.CREATED).send(response)
    })
    .catch((e)=>{
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e)
    })
 
}

const index = (req,res)=>{  
    list()
    .then(response=>{res.status(httpStatus.OK).send(response)})
    .catch(e=>{res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e)})
}

const login= (req,res)=>
{
    req.body.password = passwordToHash(req.body.password) 

     loginUser(req.body)
    .then(user=>
        {
            if(!user)
            return res.status(httpStatus.NOT_FOUND).send({message:"Böyle bir kullanıcı bulunamadı..."})
            user={
                ...user.toObject(),
                tokens:{
                    access_token :generateAccesToken(user),
                    refresh_token:generaterRefreshToken(user)
                }
            }
          
            res.status(httpStatus.OK).send(user)
        })
    .catch(e=>{res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e)})  
}

module.exports={create,index,login}