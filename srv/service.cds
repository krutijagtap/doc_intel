using {com.scb.earningupload as earning_upload} from '../db/schema.cds';

@requires: 'authenticated-user'
service EarningUploadSrv {
  @odata.draft.enabled
  //@UI.CreateHidden: {$edmJson: {$Path: '/VisibilityConfig/isAdmin'}}
  // @UI.CreateHidden: {$edmJson:  {$Path: '/VisibilityConfig/isAdmin'}}
  // @UI.DeleteHidden: {$edmJson:  {$Path: '/VisibilityConfig/isAdmin'}}
  // @UI.UpdateHidden: {$edmJson:  {$Path: '/VisibilityConfig/isAdmin'}}

    // @UI.CreateHidden: {$edmJson: {$Or: [
    //     {$Eq: [
    //         {$Path: '/EarningUploadSrv.EntityContainer/VisibilityConfig/isAdmin'},
    //         true
    //     ]},
    //     {$Eq: [
    //         {$Path: '/EarningUploadSrv.EntityContainer/VisibilityConfig/isViewer'},
    //         true
    //     ]}
    // ]}}
  
  @Capabilities.SearchRestrictions: { 
    Searchable: true
   }
  @Search.defaultSearchElement : ['bank_code','bank_name','fileName','createdBy','createdAt','quarter','status'] 
  @UI.DeleteHidden: {$edmJson: { $Path: '/EarningUploadSrv.EntityContainer/VisibilityConfig/isViewer'}}
  @UI.CreateHidden: {$edmJson: {  $Path: '/EarningUploadSrv.EntityContainer/VisibilityConfig/hideCreate'}}
  entity EarningFiles as projection on earning_upload.EarningFiles{
    *,
    bank.name as bank_name
  };
  entity Banks            as projection on earning_upload.Banks;
  entity Quarters         as projection on earning_upload.Quarters
                             order by
                               code asc;

  entity Years            as projection on earning_upload.Years
                             order by
                               code asc;

  entity VisibilityConfig as projection on earning_upload.VisibilityConfig;

  entity EmbeddingFiles as projection on earning_upload.EmbeddingFiles;
  action generateEmbedding() returns String;
  action chatResponse(prompt:String,token:String) returns String;
  action approveFiles(ids: array of  UUID) returns String;
  action rejectFiles(ids: array of UUID) returns String;
  entity FileStatusValues   as projection on earning_upload.FileStatusValues;
  entity EarningsFileStatusValues   as projection on earning_upload.FileStatusValues;



}


