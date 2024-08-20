using OrdersService as service from '../../srv/orders-service';
annotate service.Orders with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : orderNumber,
            },
            {
                $Type : 'UI.DataField',
                Value : Description,
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataFieldForAction',
            Action: 'OrdersService.EntityContainer/createContext',
            Label : 'Create Context'
        },
        {
            $Type : 'UI.DataField',
            Value : orderNumber,
        },
        {
            $Type : 'UI.DataField',
            Value : Description,
        },
    ],
);

