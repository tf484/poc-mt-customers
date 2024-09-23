using {Customers as schemaCustomers} from '../db/schema';

service CustomersService {
    entity Customers as projection on schemaCustomers
    annotate Customers with @odata.draft.enabled;
}
