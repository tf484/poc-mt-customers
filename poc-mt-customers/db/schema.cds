
using {
  cuid,
  managed
} from '@sap/cds/common';

type CustomerNumber : Decimal;
annotate CustomerNumber with @(title : '{i18n>CustomerNumber}');

type Description : String(60);
annotate Description with @(title : '{i18n>Description}');

entity Customers : cuid, managed {
    customerNumber: CustomerNumber;
    description: localized Description;
    totalAmount : Decimal;
    relatives : composition of many Relatives on relatives.customerID.ID = $self.ID
}
entity Relatives : cuid, managed {
 customerID : Association to Customers; 
 relation : String;
//  description : localized Description;

}

