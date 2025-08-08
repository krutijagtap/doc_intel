using {EarningUploadSrv as service} from '../../srv/service';

annotate service.Banks with {
  code @Common.Text: {
    $value                : name,
    ![@UI.TextArrangement]: #TextOnly,
  }
};

annotate service.Quarters with {
  code @Common.Text: {
    $value                : name,
    ![@UI.TextArrangement]: #TextOnly,
  }
};

annotate service.Years with {
  code @Common.Text: {
    $value                : name,
    ![@UI.TextArrangement]: #TextOnly,
  }
};

annotate service.EarningFiles with @UI.HeaderInfo: {
  TypeName      : 'Earning File',
  TypeNamePlural: 'Earning Files',
  Title         : {
    $Type: 'UI.DataField',
    Value: bank_code,
  },
};

annotate service.EarningFiles with {
  @Common: {
    Text                    : bank.name,
    TextArrangement         : #TextOnly,
    ValueListWithFixedValues: true,
    ValueList               : {
      $Type         : 'Common.ValueListType',
      CollectionPath: 'Banks',
      Parameters    : [{
        $Type            : 'Common.ValueListParameterInOut',
        LocalDataProperty: bank_code,
        ValueListProperty: 'code',
      }, ],
      Label         : 'Bank',
    }
  }
  bank    @title: 'Bank';
  @Common: {
    Text                    : year.name,
    TextArrangement         : #TextOnly,
    ValueListWithFixedValues: true,
    ValueList               : {
      $Type         : 'Common.ValueListType',
      CollectionPath: 'Years',
      Parameters    : [{
        $Type            : 'Common.ValueListParameterInOut',
        LocalDataProperty: year_code,
        ValueListProperty: 'code',
      }, ],
      Label         : 'Year',
    }
  }
  year    @title: 'Year';
  @Common: {
    Text                    : quarter.name,
    TextArrangement         : #TextOnly,
    ValueListWithFixedValues: true,
    ValueList               : {
      $Type         : 'Common.ValueListType',
      CollectionPath: 'Quarters',
      Parameters    : [{
        $Type            : 'Common.ValueListParameterInOut',
        LocalDataProperty: quarter_code,
        ValueListProperty: 'code',
      }, ],
      Label         : 'Quarter',
    }
  }
  quarter @title: 'Quarter';

status @title: 'Status'
@Common.ValueListWithFixedValues: true
@Common.ValueList: {
  CollectionPath: 'EarningsFileStatusValues',
  Parameters: [
    {
      $Type: 'Common.ValueListParameterInOut',
      LocalDataProperty: 'status',
      ValueListProperty: 'code'
    }
  ]
};
  
};



annotate service.EarningFiles with @(UI.SelectionFields: [
  bank_code,
  year_code,
  quarter_code
]);

annotate service.EarningFiles with @UI.LineItem: [
  {
    $Type                : 'UI.DataField',
    Value                : bank_code,
    ![@HTML5.CssDefaults]: {width: 'auto', },
  },
  {
    $Type                : 'UI.DataField',
    Value                : year_code,
    ![@HTML5.CssDefaults]: {width: 'auto', },
  },
  {
    $Type                : 'UI.DataField',
    Value                : quarter_code,
    ![@HTML5.CssDefaults]: {width: 'auto', },
  },
  {
    $Type                : 'UI.DataField',
    Value                : createdBy,
    ![@HTML5.CssDefaults]: {width: 'auto', },
  },
  {
    $Type                : 'UI.DataField',
    Value                : createdAt,
    ![@HTML5.CssDefaults]: {width: 'auto', },
  },
    
  {$Type: 'UI.DataFieldWithUrl',
     Label: 'Download',
     Value: fileName,
     Url: url},
    {
    $Type                : 'UI.DataField',
    Value                : status,
    ![@HTML5.CssDefaults]: {width: 'auto', },
  }


     
];

annotate service.EarningFiles with @UI.FieldGroup #Main: {
  $Type: 'UI.FieldGroupType',
  Data : [
    {
      $Type: 'UI.DataField',
      Value: bank_code
    },
    {
      $Type: 'UI.DataField',
      Value: year_code
    },
    {
      $Type: 'UI.DataField',
      Value: quarter_code
    },
  ]
};
annotate service.EarningFiles with {
  ID          @UI.Hidden;
  modifiedAt  @UI.Hidden;
  modifiedBy  @UI.Hidden;
} ;

annotate service.EarningFiles with @UI.Facets: [{
  $Type : 'UI.ReferenceFacet',
  ID    : 'Main',
  Label : 'Bank Details',
  Target: '@UI.FieldGroup#Main'
}];

annotate service.EarningFiles with @(Common.SideEffects: {
  SourceProperties: [content],
  TargetEntities  : ['/EarningUploadSrv.EntityContainer/EarningFiles'],
});


