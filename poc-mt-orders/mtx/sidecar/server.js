const cds = require("@sap/cds")

// const cdsSwagger = require("cds-swagger-ui-express");

// const xsenv = require("@sap/xsenv");
// xsenv.loadEnv();

// cds.on("bootstrap", async (app) => {
//   app.use(
//     cdsSwagger({
//       basePath: "/swagger",
//       diagram: "true",
//     })
//   );
// });
cds.on("served", async () => {
  const { "cds.xt.SaasProvisioningService": provisioningService, "cds.xt.DeploymentService": deploymentService } = cds.services
  // Add provisioning logic if only multitenancy is there..
  if (provisioningService) {
    // let tenantProvisioning = require("./provisioning");
    // provisioning.prepend(tenantProvisioning)
    console.log("=========> Multi-tenant Provisioning Service Found")
  } else {
    console.log("No Multi-tenant Provisioning Service Found. Tenant Provisioning for automation not Extended!")
  }

  if (deploymentService) {
    console.log("==========> Multi-tenant Deployment Service found")
    let tenantDeployment = require("./mt-utils/deployment")
    deploymentService.prepend(tenantDeployment)
    // deploymentService.on("subscribe", async (req, next) => {
    //     await next()
    //     console.log("====> Subscription data:", JSON.stringify(req.data))
    // })
    console.log("==========> Multi-tenant Deployment Service Extended")
  }

})
module.exports = cds.server
