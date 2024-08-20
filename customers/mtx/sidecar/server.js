const cds = require("@sap/cds")

cds.on("served", () => {
  const { "cds.xt.DeploymentService": ds } = cds.services

  if(ds){
    console.log("<====== Deployment Service Found =====>")
  }
  ds.before("subscribe", async (req) => {
    // HDI container credentials are not yet available here
    const { tenant } = req.data
    console.log("<=======  before subscribe ========>")
    if(tenant){
        console.log("====> tenant:", tenant)
    } else {
        console.log("====> tenant not found in data of request parameter")
    }

    if(req.data){
        console.log("====> data: ")
        console.log(req.data)
    } else {
        console.log("=====> data not found in request parameter")
    }
  })
  ds.before("upgrade", async (req) => {
    // HDI container credentials are not yet available here
    const { tenant } = req.data
  })
  ds.after("deploy", async (result, req) => {
    const { container } = req.data.options
    const { tenant } = req.data

    console.log("<=======  after deploy ========>")
    if(tenant){
        console.log("====> tenant:", tenant)
    } else {
        console.log("====> tenant not found in data of request parameter")
    }

    if(container){
        console.log("====> container:", container)
    } else {
        console.log("====> container not found in data of request parameter")
    }

    if(req.data){
        console.log("====> data: ")
        console.log(req.data)
    } else {
        console.log("=====> data not found in request parameter")
    }

  })
  ds.after("unsubscribe", async (result, req) => {
    const { container } = req.data.options
    const { tenant } = req.data
  })
})
