namespace com.scb.earningupload;

using {
  cuid,
  managed,
  sap.common.CodeList
} from '@sap/cds/common';


entity Banks : CodeList {
   key code : String(40);
}
 
entity Years : CodeList {
  key code : String(4);
}

entity Quarters : CodeList {
  key code : String(2);
}

// @UI.LineItem:[
//    { Value: bank_code,$Type: 'UI.DataField', Label: 'Bank' },
//    { Value: year_code,$Type: 'UI.DataField', Label: 'Year' },
//    { Value: quarter_code,$Type: 'UI.DataField', Label: 'Quarter' },
//    { Value: fileName,$Type: 'UI.DataField', Label: 'Download' },
// ]

 @assert.unique: {locale: [
         bank,
         year,
         quarter
]}
entity EarningFiles : cuid, managed {
  bank      : Association to Banks;
  year      : Association to Years default '2025';
  quarter   : Association to Quarters;
  

  @Core.MediaType  : mediaType
  content   : LargeString;

  @Core.IsMediaType: true @UI.Hidden
  mediaType : String;
  fileName  : String;
  @UI.Hidden
  url       : String;
  @Consumption.filterable : true
  @Common.ValueList: {
  CollectionPath: 'EarningsFileStatusValues',
  Parameters: [
    {
      $Type: 'Common.ValueListParameterInOut',
      LocalDataProperty: 'status',
      ValueListProperty: 'code'
    }
  ]
}
@Common.ValueListWithFixedValues: true
status    : String default 'Submitted';

}

@cds.server.body_parser.limit: '50mb' 
@UI.LineItem: [
    { Value: fileName,
      $Type: 'UI.DataField',
     Label: 'File Name' },
    { Value: mediaType,$Type: 'UI.DataField', Label: 'Media Type' },
    { Value: status,$Type: 'UI.DataField', Label: 'Status' },
    {$Type: 'UI.DataFieldWithUrl',Label: 'Download',Value: fileName,Url: url},
  ]
@UI.SelectionFields : [
        status,
        createdBy
    ]
  
annotate EarningFiles with {
  createdAt @UI.Hidden;
//  createdBy @UI.Hidden;
};

  @UI.LineItem: [
      {$Type: 'UI.DataFieldWithUrl',Label: 'Download',Value: fileName,Url: url},  
    { Value: mediaType, Label: 'Media Type' },
     { Value: status, Label: 'Status' },
    { Value: createdBy, Label: 'Uploaded By' }
  ]
  @UI.SelectionFields : [
        status,
        createdBy
    ]
entity EmbeddingFiles @(odata.stream)  :  managed {

  key ID: String;
  @Core.MediaType: mediaType
  content: LargeBinary ;
  @Core.IsMediaType: true
  mediaType : String;
  fileName : String;
  url      : String;
  @Consumption.filterable : true
@Common.ValueList: {
  CollectionPath: 'FileStatusValues',
  Parameters: [
    {
      $Type: 'Common.ValueListParameterInOut',
      LocalDataProperty: 'status',
      ValueListProperty: 'code'
    }
  ]
}
@Common.ValueListWithFixedValues: true
  // @Common.FilterDefaultValue: 'Submitted'

  status   : String(20);
  comments  : String;



}
action generateEmbedding() returns String;

type FileStatus : String enum {
  Completed;
  InProgress;
  Test;
};

// @odata.singleton
// entity VisibilityConfig :cuid,{
//       isAdmin : Boolean;
// };
@odata.singleton  @cds.persistency.skip
entity VisibilityConfig {
  key ID      : String;
      isAdmin : Boolean;
      isMaker: Boolean;
      isViewer: Boolean;
      hideCreate: Boolean;
}
@UI.LineItem: [{Value: code, Label: 'Status'}]
@UI.SelectionFields: [{$value: code}]
entity FileStatusValues {
  key code : String(20);
};

@UI.LineItem: [{Value: code, Label: 'Status'}]
@UI.SelectionFields: [{$value: code}]
entity EarningsFileStatusValues {
  key code : String(20);
};


