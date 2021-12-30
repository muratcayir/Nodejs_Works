const validate = require("../middlewares/validate")
const authenticate = require("../middlewares/authenticate")
const schemas = require("../validations/Projects")
const express= require("express")
const {create,index} = require("../controllers/Projects");
const router = express.Router();

router.route("/").get(authenticate,index)
router.route("/").post(validate(schemas.createValidation),create)


module.exports= router;