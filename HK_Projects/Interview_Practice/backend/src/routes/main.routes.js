const express  =  require("express")
const authDetails = require("../controllers/auth.controller")

const router =  express.Router()

  router.get("/auth", authDetails)
module.exports =  router
