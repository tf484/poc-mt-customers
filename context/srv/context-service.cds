using {Contexts as schemaContexts, } from '../db/context-schema';

using {
  Description,
  Locale,
  ContextTypeCode,
  CompositeKey,
  ContextID,
  KeyName,
  KeyValue,
  AttributeName,
  AttributeValue
} from '../db/common/';

@path: 'service/context'
service ContextService {
  @readonly
  entity Contexts as projection on schemaContexts;

  /*
   CAP does not currently support array of objects as parameter, so
   keys will be passed as a name:value comma separated  string that is parsed
   */
  function findContext(contextType : ContextTypeCode, keyString : String) returns ContextID;

  function getContextTypeDetails(contextType : ContextTypeCode)           returns {
    keys : array of KeyName;
    attributes : array of AttributeName
  };

  action   createContext(contextType : ContextTypeCode, descriptions : array of {
    locale : Locale;
    description : Description;
  }, keys : array of {
    keyName : KeyName;
    keyValue : KeyValue;
  }, attributes : array of {
    attributeName : AttributeName;
    attributeValue : AttributeValue;
  })                                                                      returns {
    contextID : ContextID;
    compositeKey : CompositeKey
  };

  action   toggleStatus(contextID : ContextID)                            returns {
    inactive : Boolean
  };

  action   updateContext(contextID : ContextID, descriptions : array of {
    locale : Locale;
    description : Description;
  }, attributes : array of {
    attributeName : AttributeName;
    attributeValue : AttributeValue;
  })

}
