const cds = require("@sap/cds")
// const debug = require("debug")("srv:provisioning")
// const cfenv = require("cfenv")
// const appEnv = cfenv.getAppEnv()
// const xsenv = require("@sap/xsenv")
const { composeTenantAutomator } = require("./tenant-automator")
//const alertNotification = require('./utils/alertNotification');
// xsenv.loadEnv()

const CREDENTIAL_STORE_CONTEXT = "poc-mt-orders"

module.exports = (service) => {
  service.on("subscribe", async (req, next) => {
    await next()

    console.log("====> Subscription data:", JSON.stringify(req.data))
    if (req.data.metadata) {
      const tenantSubdomain = req.data.metadata.subscribedSubdomain
      const tenantSubaccountId = req.data.metadata.subscribedSubaccountId
      // // Trigger tenant broker deployment on background
      // cds.spawn({ tenant: tenant }, async (tx) => {
      //     try {
      console.log(`TENANT SUB_DOMAIN =====> ${tenantSubdomain}`)
      console.log(`TENANT SUB_ACCOUNT_ID =====> ${tenantSubaccountId}`)
      const tenantAutomator = await composeTenantAutomator(tenantSubaccountId, tenantSubdomain, CREDENTIAL_STORE_CONTEXT)
      await tenantAutomator.deployTenantArtifacts()
      //     } catch (error) {
      //         // Send generic alert using Alert Notification
      //         // alertNotification.sendEvent({
      //         //     type : 'GENERIC',
      //         //     data : {
      //         //         subject : 'Error: Automation skipped because of error during subscription',
      //         //         body : JSON.stringify(error.message),
      //         //         eventType : 'alert.app.generic',
      //         //         severity : 'FATAL',
      //         //         category : 'ALERT'
      //         //     }
      //         // });
      //         console.error("Error: Automation skipped because of error during subscription");
      //         console.error(`Error: ${error.message}`);
      //     }
      // })
    }
  })

  service.on("unsubscribe", async (req, next) => {
    await next()

    console.log("====> Subscription data:", JSON.stringify(req.data))
    if (req.data.options) {
      const tenantSubdomain = req.data.options.subscribedSubdomain
      const tenantSubaccountId = req.data.options.subscribedSubaccountId
      console.log(`TENANT SUB_DOMAIN =====> ${tenantSubdomain}`)
      console.log(`TENANT SUB_ACCOUNT_ID =====> ${tenantSubaccountId}`)
      const tenantAutomator = await composeTenantAutomator(tenantSubaccountId, tenantSubdomain, CREDENTIAL_STORE_CONTEXT)
      await tenantAutomator.undeployTenantArtifacts()
    }
    // let tenantSubdomain = req.data.subscribedSubdomain;
    // let tenantSubaccountId = req.data.subscribedSubaccountId;
    // console.log('Unsubscribe Data: ', JSON.stringify(req.data));
    // await next();
    // try {
    //     const tenantAutomator = await composeTenantAutomator(tenantSubaccountId, tenantSubdomain, CREDENTIAL_STORE_CONTEXT)
    //     await tenantAutomator.undeployTenantArtifacts();
    // } catch (error) {
    //     console.error("Error: Automation skipped because of error during unsubscription");
    //     console.error(`Error: ${error.message}`);
    // }
    // return req.data.subscribedTenantId;
  })

  service.on("upgrade", async (req, next) => {
    await next()
    console.log("====> Upgrade data:", JSON.stringify(req.data))
    //const { instanceData, deploymentOptions } = cds.context.req.body;
    // const { instanceData, deploymentOptions } = req.body
    // console.log('UpgradeTenant: ', req.data.subscribedTenantId, req.data.subscribedSubdomain, instanceData, deploymentOptions);
  })

  // service.on('dependencies', async (req, next) => {
  //     let dependencies = await next();
  //     const services = xsenv.getServices({
  //         registry: { tag: 'SaaS' },
  //         html5Runtime: { tag: 'html5-apps-repo-rt' }
  //         //destination: { tag: 'destination' }
  //     });
  //     // @ts-ignore
  //     dependencies.push({ xsappname: services.html5Runtime.uaa.xsappname });
  //     //dependencies.push({ xsappname: services.destination.xsappname });
  //     console.log("SaaS Dependencies:", JSON.stringify(dependencies));
  //     return dependencies;
  // });
}
