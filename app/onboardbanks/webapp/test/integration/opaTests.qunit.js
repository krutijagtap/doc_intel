sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'onboardbanksv2/test/integration/FirstJourney',
		'onboardbanksv2/test/integration/pages/BanksList',
		'onboardbanksv2/test/integration/pages/BanksObjectPage'
    ],
    function(JourneyRunner, opaJourney, BanksList, BanksObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('onboardbanks') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheBanksList: BanksList,
					onTheBanksObjectPage: BanksObjectPage
                }
            },
            opaJourney.run
        );
    }
);