/*
chrome.identity.launchWebAuthFlow(
    {
        url: 'https://accounts.google.com/o/oauth2/auth?response_type=token&redirect_uri=https://icgemimkglpigllgjognbnbelodmklph.chromiumapp.org/provider_cb&scope=https://www.googleapis.com/auth/calendar&client_id=697110159929-7j9hchi10p913lf69qtjnqkgjr9gd3o4.apps.googleusercontent.com',
        interactive: true,
        //https://icgemimkglpigllgjognbnbelodmklph.chromiumapp.org
        //https://icgemimkglpigllgjognbnbelodmklph.chromiumapp.org
        //https://icgemimkglpigllgjognbnbelodmklph.chromiumapp.org/provider_cb
        // Include your client_id and redirect_uri
        // obtained from the Google Cloud Console
    },
    function (redirectUrl) {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
        }

        // Parse the redirect URL to extract the access token
        const params = new URLSearchParams(redirectUrl.split('#')[1]);
        const accessToken = params.get('access_token');

        // You can now use the accessToken to make API requests to Google Calendar
        console.log('Access Token:', accessToken);
    }
);
*/
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'startAuthFlow') {
        handleAuthClick();
    }
});

const handleAuthClick = () => {
    chrome.identity.launchWebAuthFlow(
        {
            url: 'https://accounts.google.com/o/oauth2/auth?response_type=token&redirect_uri=https://icgemimkglpigllgjognbnbelodmklph.chromiumapp.org/provider_cb&scope=https://www.googleapis.com/auth/calendar&client_id=697110159929-7j9hchi10p913lf69qtjnqkgjr9gd3o4.apps.googleusercontent.com',
            interactive: true,
            //https://icgemimkglpigllgjognbnbelodmklph.chromiumapp.org
            //https://icgemimkglpigllgjognbnbelodmklph.chromiumapp.org
            //https://icgemimkglpigllgjognbnbelodmklph.chromiumapp.org/provider_cb
            // Include your client_id and redirect_uri
            // obtained from the Google Cloud Console
        },
        function (redirectUrl) {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                return;
            }

            // Parse the redirect URL to extract the access token
            const params = new URLSearchParams(redirectUrl.split('#')[1]);
            const accessToken = params.get('access_token');
            // To store the access token
            chrome.runtime.sendMessage({ action: 'accessTokenRetrieved', token: accessToken });



            // You can now use the accessToken to make API requests to Google Calendar
            console.log('Access Token:', accessToken);
        }
    );
};
