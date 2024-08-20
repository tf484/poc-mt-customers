using {
  cuid,
  managed
} from '@sap/cds/common';

using {
  Description,
  ContextType,
  ContextCategory,
  ContextID,
  CompositeKey,
  ExternalName,
  KeyName,
  KeyValue,
  AttributeName,
  AttributeValue
} from './common';

@assert.unique: {
  compositeKey: [ compositeKey ]
}
entity Contexts : cuid, managed {
  contextType     : ContextType;
  contextCategory : ContextCategory;
  compositeKey    : CompositeKey;
  externalName    : ExternalName;
  description     : localized Description;
  inactive        : Boolean default false;
  keys            : Composition of many {
                      key ID       : UUID;
                          keyName  : KeyName;
                          keyValue : KeyValue;
                    }
  attributes      : Composition of many {
                      key ID             : UUID;
                          attributeName  : AttributeName;
                          attributeValue : AttributeValue;
                    }
}

