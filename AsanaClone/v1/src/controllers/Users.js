const { insert, list, loginUser, modify,remove} = require("../services/Users");
const projectService = require("../services/Projects");
const eventEmitter = require("../scripts/events/eventEmitter");
const path =require("path")
const httpStatus = require("http-status");
const uuid = require("uuid");
const {
  passwordToHash,
  generateAccesToken,
  generaterRefreshToken,
} = require("../scripts/utils/helper");

const create = (req, res) => {
  req.body.password = passwordToHash(req.body.password);
  insert(req.body)
    .then((response) => {
      res.status(httpStatus.CREATED).send(response);
    })
    .catch((e) => {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
    });
};

const login = (req, res) => {
  req.body.password = passwordToHash(req.body.password);

  loginUser(req.body)
    .then((user) => {
      if (!user)
        return res
          .status(httpStatus.NOT_FOUND)
          .send({ message: "Böyle bir kullanıcı bulunamadı..." });
      user = {
        ...user.toObject(),
        tokens: {
          access_token: generateAccesToken(user),
          refresh_token: generaterRefreshToken(user),
        },
      };
      delete user.password;
      res.status(httpStatus.OK).send(user);
    })
    .catch((e) => {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
    });
};

const index = (req, res) => {
  list()
    .then((response) => {
      res.status(httpStatus.OK).send(response);
    })
    .catch((e) => {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send(e);
    });
};

const projectList = (req, res) => {
    
  projectService
    .list({ user_id: req.user?._id })
    .then((projects) => {
      res.status(httpStatus.OK).send(projects);
    })
    .catch(() =>
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
        error: "Projeler getirilirken beklenmeyen bir hata gerçekleşti...",
      })
    );

  
};

const resetPassword = (req, res) => {
  const new_password =
    uuid.v4()?.split("-")[0] || `usr-${new Date().getTime()}`;
  modify({ email: req.body.email }, { password: passwordToHash(new_password) })
    .then((updatedUser) => {
      if (!updatedUser)
        return res
          .status(httpStatus.NOT_FOUND)
          .send({ error: "Böyle bir kullanıcı bulunmamaktadır" });
      eventEmitter.emit("send_email", {
        to: updatedUser.email,
        subject: "Şifre sıfırlama talebi",
      });

      res.status(httpStatus.OK).send({
        message:
          "Şifre değiştirme talebinizin tamamlanması için gerekli bilgiler email adresinize iletilmiştir. ",
      });
    })
    .catch(() =>
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .send({ error: "Şifre resetleme sırasında bir hata oluştu" })
    );
};

const update = (req, res) => {
  modify({ _id: req.user?._id }, req.body)
    .then((updatedUser) => {
      res.status().send(updatedUser);
    })
    .catch(() =>
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .send({ error: "Güncelleme işlemi sırasında bir hata gerçekleşti..." })
    );
};

const changePassword = (req, res) => {

  req.body.password=passwordToHash(req.body.password)
 
  modify({ _id: req.user?._id }, req.body)
    .then((updatedUser) => {
      res.status().send(updatedUser);
    })
    .catch(() =>
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .send({ error: "Güncelleme işlemi sırasında bir hata gerçekleşti..." })
    );
};

const deleteUser =(req,res)=>{
  if(!req.params?.id){
    return res.status(httpStatus.BAD_REQUEST).send({
      message:"ID Bilgisi Eksik."
    })
  }
  
  remove(req.params?.id)
  .then((deletedItem)=>{
    if(!deletedItem){
      return res.status(httpStatus.NOT_FOUND).send({
        message:"Kayıt bulunamadı."
      })
    }
    return res.status(httpStatus.OK).send({
      message:"Kayıt silinmiştir."
    })
  })
  .catch((e)=>{
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({error:"Silme işlemi sırasında bir hata  oluştu."})
  })
};

const updateProfileImage =(req,res)=>{
 //Resim Kontrolü 
 console.log(req.files) 
if(!req?.files?.profile_image)
{
  return res.status(httpStatus.BAD_REQUEST).send({error:"Bu işlemi yapamazsınız"})
}
//Upload İşlemi
const extension = path.extname(req.files.profile_image.name);
const fileName = `${req?.user?._id}${extension}`
const folderPath = path.join(__dirname,"../","uploads/users",fileName)

req.files.profile_image.mv(folderPath,function (err){
  if(err) return res.status(httpStatus.INTERNAL_SERVER_ERROR).send({error:err})
  modify({_id:req?.user?._id},{profile_image:fileName})
  .then((updatedUser)=>{
    res.status(httpStatus.OK).send(updatedUser)
    
  })
  .catch((e)=>res.status(httpStatus.INTERNAL_SERVER_ERROR).send({error:"Upload başarılı fakat yükleme sırasında bir hata gerçekleşti"}))
})
}
module.exports = { create, index, login, projectList, resetPassword ,update,deleteUser,changePassword,updateProfileImage};
