const cds = require("@sap/cds");
const { Roles, Messages, Status } = require('./utils/constants')


module.exports = cds.service.impl((srv) => {

    const {VisibilityConfig} = srv.entities;
    srv.on("READ",VisibilityConfig, async (req) => {
      let viewer;
      if(!req.user.is(Roles.EarningsAdmin) && !req.user.is(Roles.EarningsViewer)){
         viewer = true;
      }else{
        viewer = false;
      }       
      req.reply({
        isAdmin: req.user.is(Roles.EarningsAdmin),
        isMaker: req.user.is(Roles.EarningsViewer),
        isViewer: viewer,
        hideCreate: !req.user.is(Roles.EarningsViewer),
      })
    });

});