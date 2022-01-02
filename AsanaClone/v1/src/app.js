const express = require("express")
const helmet = require("helmet")
const fileUpload = require("express-fileupload")
const config = require("./config")
const loaders = require("./loaders")
const events = require("./scripts/events")
const path = require("path")
const {ProjectRoutes,UserRoutes} = require("./api-routes")

config()
loaders()
events()

const app = express()
app.use("/uploads",express.static(path.join(__dirname,"./","uploads")))
app.use(express.json())
app.use(helmet())
app.use(fileUpload())

app.listen(process.env.APP_PORT,()=>{
    console.log(`sunucu  çalışıyor`)
    app.use("/projects",ProjectRoutes)
    app.use("/users",UserRoutes) 
})