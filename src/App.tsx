/// <reference types="chrome"/>

import { AbsoluteCenter, Accordion, Alert, AlertIcon, Box, Button, Card, CardBody, CardHeader, Center, Checkbox, CircularProgress, Divider, Flex, Grid, Spinner, Stack, StackItem, Text } from "@chakra-ui/react";
import { useState } from "react";
import { CalendarIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, InfoOutlineIcon, MinusIcon, SmallCloseIcon, StarIcon } from '@chakra-ui/icons';
import "./App.css"


const handleAuthClick = () => {
  chrome.runtime.sendMessage({ action: 'startAuthFlow' });
};

const testCreateEvent = () => {
  chrome.runtime.sendMessage({ action: 'createEvent' });
}


function App() {
  const [accessToken, setAccessToken] = useState('');
  const [SubItUpEvents, setSubItUpEvents] = useState([]);
  const [uploadingEvents, setUploadingEvents] = useState(false);

  chrome.storage.local.get(null, function (data) {
    setAccessToken(data.accessToken);
    if (data.shifts !== undefined) {
      setSubItUpEvents(data.shifts);
    }
  });

  const logOut = () => {
    chrome.storage.local.clear(function () {
      // This callback function is optional and will be called after the data is cleared.
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else {
        console.log("chrome.storage.local data cleared successfully.");
        setAccessToken('');
        setSubItUpEvents([]);
        setCheckedShifts([]);
      }
    });
  }

  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action == 'loggedOut') {
      //chrome.storage.local.set({ 'accessToken': message.token }, function () {
      //  console.log('Value is set to ' + message.token);
      //  setAccessToken(message.token);
      //});
      logOut();
    }
    if (message.action == 'startUploadingEvents') {
      setUploadingEvents(true);
    }
    if (message.action == 'endUploadingEvents') {
      setUploadingEvents(false);
    }
  });

  const MainApp = () => {

    const authorizationButton =
      <AbsoluteCenter axis='both'><Button onClick={handleAuthClick}>Log Into Google Calendar</Button></AbsoluteCenter>

    const test = <Button onClick={testCreateEvent}>Create Events</Button>

    const uploadingProgress =
      <Grid>
        <AbsoluteCenter axis='both'>
          <Text fontSize='3xl'>Uploading events to Google Calendar...</Text>
        </AbsoluteCenter>
        <AbsoluteCenter axis='both'>
          <Spinner size='xl' />
        </AbsoluteCenter>
      </Grid>

    if (accessToken === undefined) {
      return authorizationButton;
    }
    else if (uploadingEvents) {
      return uploadingProgress;
    }
    else {
      return shiftsList();
    }
  }

  /*
  if (checkedShifts !== undefined) {
    if (SubItUpEvents.length === 0) {
      setCheckedShifts(SubItUpEvents
        .filter((shift) => shift['addToGoogleCalendar'] === true)
        .map((shift) => shift['shiftid'])
      )
    }
  }
  */

  const addToGoogleCalendar = () => {
    chrome.runtime.sendMessage({ action: 'uploadToGoogleCalendar', shiftIds: checkedShifts, shiftData: SubItUpEvents, token: accessToken });
  }

  const [checkedShifts, setCheckedShifts] = useState(SubItUpEvents.filter((shift) => shift['addToGoogleCalendar'] == true)
    .map((shift) => shift['shiftid']));

  const shiftsList = () => {
    if (SubItUpEvents.length === 0) {
      return (
        <Grid>
          <Center>
            <CircularProgress isIndeterminate color='green.300' />
          </Center>
          <Text fontSize='2xl'>Please Navigate to SubItUp.com, log-in, refresh the page, and re-open the extension.</Text>
        </Grid>
      )
    }

    const submitButton = <Box>
      <Button colorScheme='blue' onClick={addToGoogleCalendar}>
        <Grid>
          <Text fontSize='2xl'>
            Add To Google Calendar
          </Text>
        </Grid>
      </Button>
      <Text fontSize='xs'>
        {"Failure will indicate having to re-login. (AccessToken Expired)"}
      </Text>
    </Box>

    const logoutButton = <Button colorScheme='red' onClick={logOut}>Logout</Button>

    function parseDateString(dateStr: string) {
      const [datePart, timePart] = dateStr.split(' ');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute, second] = timePart.split(':').map(Number);

      return new Date(year, month - 1, day, hour, minute, second);
    }


    let shiftSelection = (
      <Stack spacing={3}>
        {SubItUpEvents.sort(
          function (shift_a, shift_b) {
            const dateA: any = parseDateString(shift_a['milstart']);
            const dateB: any = parseDateString(shift_b['milstart']);

            if (shift_a['addToGoogleCalendar'] == false) {
              return 1;
            }
            return dateA - dateB;
          }
        ).map((shift) => (
          <StackItem>
            <Card variant={(shift['addToGoogleCalendar']) ? 'elevated' : 'filled'}>
              <CardHeader>
                <Checkbox
                  size='lg'
                  colorScheme='green'
                  defaultChecked={
                    false//shift['addToGoogleCalendar']
                  }
                  onChange={(e) => {
                    let index = checkedShifts.indexOf(shift['shiftid']);
                    if (index == -1 && e.target.checked) {
                      setCheckedShifts(checkedShifts.concat([shift['shiftid']]));
                    }
                    else if (!e.target.checked) {
                      setCheckedShifts(checkedShifts.filter((shiftid) => shiftid !== shift['shiftid']));
                    }
                  }}
                >
                  {shift['ShiftName']}
                </Checkbox>
              </CardHeader>
              <CardBody>
                <Stack>
                  <StackItem>
                    <ChevronRightIcon />{shift['Title']}<ChevronLeftIcon />
                  </StackItem>
                  <StackItem>
                    <Box bg={(shift['addToGoogleCalendar']) ? 'green.100' : 'red.100'}>
                      {"Is this shift assigned to you? "}
                      {(shift['addToGoogleCalendar']) ? <CheckIcon /> : <SmallCloseIcon />}
                    </Box>
                  </StackItem>
                  <StackItem>
                    <CalendarIcon />
                    {"  "}
                    {shift['milend']}
                    {" "}
                    <MinusIcon />
                    {" "}
                    {shift['milstart']}
                  </StackItem>
                </Stack>
              </CardBody>
            </Card>

          </StackItem>
        ))
        }
      </Stack >
    )
    return (
      <Grid>
        <Alert status='info'>
          <AlertIcon />
          Darkened Shifts are Availabe Shifts! (Not Taken).
        </Alert>

        <Box position='relative' padding='10'>
          <Divider />
          <AbsoluteCenter bg='white' px='4'>
            Shifts This Week
          </AbsoluteCenter>
        </Box>

        {shiftSelection}
        <Center height='50px'>
          <Divider orientation='vertical' />
        </Center>
        {submitButton}
        <Center height='50px'>
          <Divider orientation='vertical' />
        </Center>
        {logoutButton}
      </Grid>

    );
  }
  return (
    <div className="App">
      {MainApp()}
    </div>
  );
}

export default App;
