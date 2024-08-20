using {Contexts as schemaContexts} from '../db/context-schema';
using {
  ContextsAll            as schemaContextsAll,
  ContextsForPlants      as schemaContextsForPlants,
  ContextsForWorkcenters as schemaContextsForWorkcenters,
  ContextsForMaterials   as schemaContextsForMaterials,
  ContextsForSalesItems  as schemaContextsForSalesItems
} from '../db/category-schema';

using {
  Description,
  ContextCategory
} from '../db/common/';

@path: 'service/context-category'
service ContextCategoryService {
  @readonly
  entity Contexts               as projection on schemaContexts;

  @readonly
  entity ContextsAll            as projection on schemaContexts;

  @readonly
  entity ContextsForPlants      as projection on schemaContextsForPlants;

  @readonly
  entity ContextsForWorkcenters as projection on schemaContextsForWorkcenters;

  @readonly
  entity ContextsForMaterials   as projection on schemaContextsForMaterials;

  @readonly
  entity ContextsForSalesItems  as projection on schemaContextsForSalesItems;

}
