sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'pocmtcustomers/test/integration/FirstJourney',
		'pocmtcustomers/test/integration/pages/CustomersList',
		'pocmtcustomers/test/integration/pages/CustomersObjectPage'
    ],
    function(JourneyRunner, opaJourney, CustomersList, CustomersObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('pocmtcustomers') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheCustomersList: CustomersList,
					onTheCustomersObjectPage: CustomersObjectPage
                }
            },
            opaJourney.run
        );
    }
);