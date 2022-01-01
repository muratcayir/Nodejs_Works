const { insert, list, loginUser, modify } = require("../services/Users");
const projectService = require("../services/Projects");
const eventEmitter = require("../scripts/events/eventEmitter");
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
module.exports = { create, index, login, projectList, resetPassword ,update};
