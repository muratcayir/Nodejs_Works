const Mongoose =  require("mongoose");

const UserSchema = new Mongoose.Schema({
    full_name:String,
    password:String,
    email:String,
    profile_image:String
},
{
    versionKey:false,timestamps:true
}

)

module.exports = Mongoose.model("user",UserSchema)