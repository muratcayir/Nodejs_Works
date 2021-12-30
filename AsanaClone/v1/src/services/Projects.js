//  Genel olarak model üzerinden kayıt işlemini gerçekleştirmek ve 
// hata varsa yönlendirme yapmak
const Project = require("../models/Projects")

const insert =(projectData)=>{
    
    const project =new Project(projectData)
    return project.save()
}

const list= ()=>{
    return Project.find({})
}

module.exports={insert,list}