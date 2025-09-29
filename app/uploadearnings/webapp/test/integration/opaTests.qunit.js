sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/scb/uploadearningsv2/test/integration/FirstJourney',
		'com/scb/uploadearningsv2/test/integration/pages/EarningFilesList',
		'com/scb/uploadearningsv2/test/integration/pages/EarningFilesObjectPage'
    ],
    function(JourneyRunner, opaJourney, EarningFilesList, EarningFilesObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/scb/uploadearnings') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheEarningFilesList: EarningFilesList,
					onTheEarningFilesObjectPage: EarningFilesObjectPage
                }
            },
            opaJourney.run
        );
    }
);