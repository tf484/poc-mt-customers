using CustomersService as service from '../../srv/customers-service';
using from '../../db/schema';

annotate service.Customers with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : customerNumber,
            },
            {
                $Type : 'UI.DataField',
                Value : description,
            },
             {
                $Type : 'UI.DataField',
                Value : totalAmount,
        }
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Relatives',
            ID : 'Relatives',
            Target : 'relatives/@UI.LineItem#Relatives',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Texts',
            ID : 'Texts',
            Target : 'texts/@UI.LineItem#Texts',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : customerNumber,
        },
        {
            $Type : 'UI.DataField',
            Value : description,
        },
           {
                $Type : 'UI.DataField',
                Value : totalAmount,
        }
    ],
    UI.FieldGroup #texts : {
        $Type : 'UI.FieldGroupType',
        Data : [
        ],
    },
);

annotate service.Customers.texts with @(
    UI.LineItem #Texts : [
        {
            $Type : 'UI.DataField',
            Value : description,
        },
        {
            $Type : 'UI.DataField',
            Value : ID,
            Label : 'ID',
        },
        {
            $Type : 'UI.DataField',
            Value : locale,
        },
    ]
);

annotate service.Relatives with @(
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'general',
            ID : 'general',
            Target : '@UI.FieldGroup#general',
        },
    ],
    UI.FieldGroup #general : {
        $Type : 'UI.FieldGroupType',
        Data : [
            // {
            //     $Type : 'UI.DataField',
            //     Value : description,
            // },
            {
                $Type : 'UI.DataField',
                Value : relation,
                Label : 'relation',
            },
        ],
    },
    UI.LineItem #Relatives : [
        // {
        //     $Type : 'UI.DataField',
        //     Value : description,
        // },
        {
            $Type : 'UI.DataField',
            Value : relation,
            Label : 'relation',
        },
    ],
);

