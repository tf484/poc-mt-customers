const cds = require('@sap/cds');

const cdsSwagger = require('cds-swagger-ui-express');

const xsenv = require('@sap/xsenv');
xsenv.loadEnv();

cds.on('bootstrap', async (app) => {

     app.use(cdsSwagger({
         "basePath": "/swagger",
         "diagram": "true"
     }));
    
});
cds.on('served', async () => {
    const { 'cds.xt.SaasProvisioningService': provisioning } = cds.services
    // Add provisioning logic if only multitenancy is there..
    if(provisioning){
        let tenantProvisioning = require('./provisioning');
        provisioning.prepend(tenantProvisioning);
    }
    else{
        console.log("No Multi-tenant Provisioning Service Found. Tenant Provisioning for automation not Extended!");
    }
  })
module.exports = cds.server;