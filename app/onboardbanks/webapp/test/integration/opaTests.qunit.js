sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'onboardbanks/test/integration/FirstJourney',
		'onboardbanks/test/integration/pages/BanksList',
		'onboardbanks/test/integration/pages/BanksObjectPage'
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