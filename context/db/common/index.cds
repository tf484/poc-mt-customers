using {sap.common.CodeList} from '@sap/cds/common'; 

type ContextID : UUID;
annotate ContextID with @(title : '{i18n>ContextID}');

type ContextTypeCode : String(30);
annotate ContextTypeCode with @(title : '{i18n>ContextType}');

type ContextCategoryCode : String(30);
annotate ContextCategoryCode with @(title : '{i18n>ContextCategory}');

type ExternalName : String(80);
annotate ExternalName with @(title : '{i18n>ExternalName}');

type CompositeKey : String(255);
annotate CompositeKey with @(title : '{i18n>CompositeKey}');

type KeyName: String(20);
annotate KeyName with @(title : '{i18n>KeyName}');

type KeyValue: String(255);
annotate KeyValue with @(title : '{i18n>KeyValue}');

type AttributeName: String(20);
annotate AttributeName with @(title : '{i18n>AttributeName}');

type AttributeValue: String(255);
annotate AttributeValue with @(title : '{i18n>AttributeValue}');

type Description : String(60);
annotate Description with @(title : '{i18n>Description}');

type Locale : String(14);
annotate Locale with @(title : '{i18n>Locale}');


//Context Types
entity ContextTypes : CodeList {
  key code : ContextTypeCode @(title : '{i18n>ContextType}');
}
annotate ContextTypes with {
  code @Common.Text : name;
}

type ContextType : Association to ContextTypes;
annotate ContextType with @(title : '{i18n>ContextType}');

//Context Categories
entity ContextCategories : CodeList {
  key code : ContextCategoryCode @(title : '{i18n>ContextCategory}');
}
annotate ContextCategories with {
  code @Common.Text : name;
}

type ContextCategory : Association to ContextCategories;
annotate ContextCategory with @(title : '{i18n>ContextCategory}');