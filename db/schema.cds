

using {
  cuid,
  managed
} from '@sap/cds/common';

type CustomerName : String(30);
annotate CustomerName with @(title : '{i18n>CustomerName}');

type Description : String(60);
annotate Description with @(title : '{i18n>Description}');

entity Customers : cuid, managed {
    customerName: CustomerName;
    Description: Description;
}