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


chrome.storage.local.get(null, function (data) {
    console.log(data);
});
chrome.storage.local.set({ 'Yo': 'Joe' }, function () {
    console.log('Value is set to ' + 'Joe');
});
chrome.storage.local.get(null, function (data) {
    console.log(data);
});

const checkUserAuth = (accessToken) => {
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
    };
    fetch("https://www.googleapis.com/oauth2/v1/tokeninfo", {
        method: 'GET',
        headers,
    })
        .then((response) => {
            if (!response.ok) {
                console.error('Authorization token no longer valid. Please log in again.');
                return false;
            }
            console.log('Authorization token is valid.');
            return true;
        })
        .catch((_) => {
            console.error('Authorization token no longer valid. Please log in again.');
            return true;
        });
}

if (!checkUserAuth()) {
    chrome.runtime.sendMessage({ action: 'loggedOut' });
}

const testCreateEvent = () => {
    //let accessToken = "ya29.a0AfB_byB5x03Mo5qS1XoPQ-oMZUpv8gdwRgK1wFPIkyxelvzclKBvsTdlKHRz67eKwYf3HNGlQA7xNL6YPmOcRE5w5Zw9A7b3uUoaw1ONj7p6Bvq2Bk2X7olTD12r9Ul_1llGG7pLkhr86mqswPMcjmsUv2EtxNrbk7muvgaCgYKAZkSARASFQHsvYls63Z0MwgjH-PMsVGIm43OmQ0173";
    // Your access token obtained through OAuth
    //accessToken = "ya29.a0AfB_byAtY9cPtrW6076KnD2HQCGdtivnflSRNaX8QudmDawVliSWyPD7przmk8aT9bBimerGVFY75nAJtRMDsj8tSV82URty2PfHZiQyzqJL4fdiX1Vjd6pt-Sw_DzsBPQdMveMZN2Z0MXUx9i5WeFluFxwLWSu8iVPnrwaCgYKAeYSARASFQHsvYlsMjSiBlBxkVafGvAMO8DGWg0173";

    // Define the event data in JSON format
    const eventData = {
        summary: 'Sample Event',
        description: 'This is a sample event created via API.',
        start: {
            dateTime: '2023-09-01T10:00:00',
            timeZone: 'America/New_York',
        },
        end: {
            dateTime: '2023-09-01T11:00:00',
            timeZone: 'America/New_York',
        },
    };

    // Define the API endpoint for creating an event
    const calendarApiUrl = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

    // Set up the request headers
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
    };

    // Make a POST request to create the event
    fetch(calendarApiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(eventData),
    })
        .then((response) => {
            if (!response.ok) {
                if (response.status == 401) {
                    // Unauthorized, log the person out.
                }
                throw new Error(`Failed to create event. Status code: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            console.log('Event created successfully!');
            console.log(data);
        })
        .catch((error) => {
            console.error('Error:', error.message);
        });

}

const createShiftEvents = async (shiftIds, shiftData, accessToken) => {
    let shiftsToAddToCalendar = shiftData.filter((shift) => {
        let index = shiftIds.indexOf(shift['shiftid']);
        if (index != -1) {
            return true;
        }
        return false;
    });
    let shiftDataToAddToCalendar = shiftsToAddToCalendar.map((shift) => {
        return {
            summary: shift['ShiftName'],
            description: shift['HelpfulInfo'],
            start: {
                dateTime: shift['milstart'].replace(' ', 'T'),
                timeZone: 'America/New_York',
            },
            end: {
                dateTime: shift['milend'].replace(' ', 'T'),
                timeZone: 'America/New_York',
            }
        }
    });

    // Define the API endpoint for creating an event
    const calendarApiUrl = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

    const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
    // Set up the request headers
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
    };

    chrome.runtime.sendMessage({ action: 'startUploadingEvents' });
    for (const shiftData of shiftDataToAddToCalendar) {
        // Make a POST request to create the event
        fetch(calendarApiUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(shiftData),
        })
            .then((response) => {
                if (!response.ok) {
                    if (response.status == 401) {
                        // Unauthorized, log the person out.

                        chrome.runtime.sendMessage({ action: 'loggedOut' });
                    }
                    throw new Error(`Failed to create event. Status code: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log('Event created successfully!');
                console.log(data);
            })
            .catch((error) => {
                console.error('Error:', error.message);
            });
        await sleep(2000);
    }
    chrome.runtime.sendMessage({ action: 'endUploadingEvents' });
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'startAuthFlow') {
        handleAuthClick();
    }
    if (message.action === 'createEvent') {
        testCreateEvent();
    }
    if (message.action === 'uploadToGoogleCalendar') {
        console.log(message.shiftIds);
        createShiftEvents(message.shiftIds, message.shiftData, message.token);
    }
});

function getWeekBounds(date) {
    const currentDay = date.getDay();
    const startDate = new Date(date);
    const endDate = new Date(date);

    startDate.setDate(startDate.getDate() - currentDay);

    endDate.setDate(endDate.getDate() + (6 - currentDay));

    return { startDate, endDate };
}

const currentDate = new Date();
const { startDate, endDate } = getWeekBounds(currentDate);

// Intercept network requests
let done = false;
chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
        if (details.url.includes("GetEmployeeScheduleData")) {
            if (details.method === "POST" && details.type === "xmlhttprequest") {
                let payload = null;

                try {
                    // Extract payload from request body
                    payload = JSON.parse(decodeURIComponent(new TextDecoder().decode(details.requestBody.raw[0].bytes)));
                } catch (error) {
                    console.error("Error parsing payload:", error);
                }

                if (payload) {
                    if (done === false) {
                        done = true;
                        // Inform the background script to track the payload
                        console.log(payload);
                        payload['startdate'] = startDate;
                        payload['enddate'] = endDate;
                        fetch(details.url, {
                            method: details.method,
                            headers: {
                                "Content-Type": "application/json",
                                // Add any other necessary headers
                            },
                            body: JSON.stringify(payload),
                        })
                            .then((response) => response.json())
                            .then((responseData) => {
                                responseData.forEach((element, index, array) => {
                                    element['ShiftName'] = element['ShiftName'].replace('%2f', ' / ');
                                    if (element['noStaffAssigned'] == 'false') {
                                        array[index]['addToGoogleCalendar'] = true;
                                        array[index]['noStaffAssigned'] = false;
                                    }
                                    else {
                                        array[index]['addToGoogleCalendar'] = false;
                                        array[index]['noStaffAssigned'] = false;
                                    }
                                });
                                chrome.storage.local.set({ 'shifts': responseData }, function () {
                                    // Encrypt and store the access token
                                    console.log('shifts is set to ' + responseData[0].stringify());
                                });
                                console.log("Resent Request Response:", responseData);
                            })
                            .catch((error) => {
                                console.error("Error resending request:", error);
                            });
                    }
                }
            }

        }
    },
    { urls: ["https://*.subitup.com/*"] },
    ["requestBody"]
);

const handleAuthClick = () => {
    try {
        chrome.identity.launchWebAuthFlow(
            {
                url: 'https://accounts.google.com/o/oauth2/auth?prompt=consent&response_type=token&redirect_uri=https://bpceepmanghbdihilafngmapgjmdfcek.chromiumapp.org/provider_cb&scope=https://www.googleapis.com/auth/calendar&client_id=697110159929-7j9hchi10p913lf69qtjnqkgjr9gd3o4.apps.googleusercontent.com',
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

                chrome.storage.local.set({ 'accessToken': accessToken }, function () {
                    // Encrypt and store the access token
                    console.log('Value is set to ' + accessToken);
                });

                // You can now use the accessToken to make API requests to Google Calendar
                console.log('Access Token:', accessToken);
            }
        );
    } catch (err) {
        chrome.runtime.sendMessage({ action: 'loggedOut' })
    }
};
