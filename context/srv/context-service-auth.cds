using ContextService from './context-service';
annotate ContextService @(requires: 'authenticated-user');

annotate ContextService.Contexts @(requires: ['admin', 'admin-api', 'system-user']);

annotate ContextService.findContext @(requires: ['admin', 'admin-api', 'system-user']);

annotate ContextService.getContextTypeDetails @(requires: ['admin', 'admin-api', 'system-user']);

annotate ContextService.createContext @(requires: ['admin', 'admin-api']);

annotate ContextService.toggleStatus @(requires: ['admin', 'admin-api']);

annotate ContextService.updateContext @(requires: ['admin', 'admin-api']);

