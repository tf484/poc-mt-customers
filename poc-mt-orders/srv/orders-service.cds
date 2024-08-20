using {Orders as schemaOrders} from '../db/schema';

service OrdersService {
    entity Orders as projection on schemaOrders
    annotate Orders with @odata.draft.enabled;

    action createContext();
}
