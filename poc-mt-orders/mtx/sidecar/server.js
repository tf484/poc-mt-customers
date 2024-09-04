const cds = require("@sap/cds")

const CREDENTIAL_STORE_NAMESPACE = "poc-mt-orders"

cds.on("served", async () => {
  const {"cds.xt.DeploymentService": deploymentService } = cds.services

  const log = cds.log("aic")

  // Add deployment logic if only multitenancy is present
  if (deploymentService) {
    log._info && log.info("==========> Multi-tenant Deployment Service found")

    const deployment = require("./mt-utils/deployment")
    deployment.initialize({credentialStoreNamespace: CREDENTIAL_STORE_NAMESPACE})
    deploymentService.prepend(deployment.tenantDeployment)

    log._info && log.info("==========> Multi-tenant Deployment Service Extended")
  }

})
module.exports = cds.server
