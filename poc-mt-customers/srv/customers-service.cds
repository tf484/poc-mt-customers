using { Customers as schemaCustomers } from '../db/schema';

service CustomerService {
    entity Customers as projection on schemaCustomers;
    annotate Customers @odata.draft.enabled;
}