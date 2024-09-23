
using {
  cuid,
  managed
} from '@sap/cds/common';

type CustomerNumber : Decimal;
annotate CustomerNumber with @(title : '{i18n>CustomerNumber}');

type Description : String(60);
annotate Description with @(title : '{i18n>Description}');

entity Customers : cuid, managed {
    orderNumber: CustomerNumber;
    Description: Description;
}

