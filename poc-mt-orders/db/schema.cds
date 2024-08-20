
using {
  cuid,
  managed
} from '@sap/cds/common';

type OrderNumber : Decimal;
annotate OrderNumber with @(title : '{i18n>OrderNumber}');

type Description : String(60);
annotate Description with @(title : '{i18n>Description}');

entity Orders : cuid, managed {
    orderNumber: OrderNumber;
    Description: Description;
}

