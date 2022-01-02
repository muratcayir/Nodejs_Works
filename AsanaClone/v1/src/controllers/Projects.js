const { insert,modify, list, remove} = require("../services/Projects");
const httpStatus = require("http-status");

const index = (req, res) => {
  console.log("user :",req.user)
  list()
    .then((response) => {
      res.status(httpStatus.OK).send(response);
    })
    .catch((e) => {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
    });
};

const create = (req, res) => {
  req.body.user_id=req.user;  
  insert(req.body)
    .then((response) => {
      res.status(httpStatus.CREATED).send(response);
    })
    .catch((e) => {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
    });
};


const update = (req,res)=>{

if(!req.params?.id){
  return res.status(httpStatus.BAD_REQUEST).send({
    message:"ID Bilgisi Eksik..."
  })
}
modify(req.body,req.params?.id)
.then((updatedProject)=>{
  res.status(httpStatus.OK).send(updatedProject)
})
.catch((e)=>{
  res.status(httpStatus.INTERNAL_SERVER_ERROR).send({error:"Kayıt sırasında bir hata  oluştu..."})
})
}

const deleteProject =(req,res)=>{
  if(!req.params?.id){
    return res.status(httpStatus.BAD_REQUEST).send({
      message:"ID Bilgisi Eksik."
    })
  }
  
  remove(req.params?.id)
  .then((deletedItem)=>{
    if(!deletedItem){
      return res.status(httpStatus.NOT_FOUND).send({
        message:"Proje bulunamadı."
      })
    }
    return res.status(httpStatus.OK).send({
      message:"Proje silinmiştir."
    })
  })
  .catch((e)=>{
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({error:"Silme işlemi sırasında bir hata  oluştu."})
  })
};


module.exports = { create, index ,update, deleteProject};
