using {com.scb.earningupload as earning_upload} from '../db/schema.cds';
service configSrv {

  @odata.draft.enabled
  @UI.DeleteHidden: {$edmJson: { $Path: '/configSrv.EntityContainer/VisibilityConfig/isViewer'}}
  @UI.CreateHidden: {$edmJson: { $Path: '/configSrv.EntityContainer/VisibilityConfig/isViewer'}}
  entity Banks as projection on earning_upload.Banks  ;

  entity VisibilityConfig as projection on earning_upload.VisibilityConfig;

}