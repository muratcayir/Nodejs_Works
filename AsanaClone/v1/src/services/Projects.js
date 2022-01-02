//  Genel olarak model üzerinden kayıt işlemini gerçekleştirmek ve 
// hata varsa yönlendirme yapmak
const Project = require("../models/Projects")

const insert =(data)=>{
    const project =new Project(data)
    return project.save()
}

const list= (where)=>{
    return Project.find(where || {}).populate({
        path:"user_id",
        select:"full_name email profil_image"
    })
}

const modify = (data,id)=>{
return Project.findByIdAndUpdate(id,data,{new:true})
}

const remove = (id)=>{
return Project.findByIdAndDelete(id)
}
module.exports={insert,list,modify,remove}