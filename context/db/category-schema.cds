using {Contexts as schemaContexts } from './context-schema';


entity ContextsAll as
  select
    ID,
    createdAt,
    createdBy,
    modifiedAt,
    modifiedBy,
    contextType,
    contextCategory,
    compositeKey,
    externalName,
    description,
    inactive
  from schemaContexts
  where
    inactive = false;

entity ContextsForPlants as
  select
    ID,
    contextType,
    compositeKey,
    externalName,
    description
  from schemaContexts
  where
    contextCategory.code = 'plant' and inactive = false;

entity ContextsForWorkcenters as
  select
    ID,
    contextType,
    compositeKey,
    externalName,
    description
  from schemaContexts
  where
    contextCategory.code = 'workcenter' and inactive = false;

entity ContextsForMaterials as
  select
    ID,
    contextType,
    compositeKey,
    externalName,
    description
  from schemaContexts
  where
    contextCategory.code = 'material' and inactive = false;

entity ContextsForSalesItems as
  select
    ID,
    contextType,
    compositeKey,
    externalName,
    description
  from schemaContexts
  where
    contextCategory.code = 'sales-item' and inactive = false;