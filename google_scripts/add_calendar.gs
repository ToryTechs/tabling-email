var spreadsheetURL = 'https://docs.google.com/spreadsheets/d/1wUnWnuSOA8ijIWEesARv2kPfcz2gWq2EvPJWws3x1XA/edit?'
var sheet = SpreadsheetApp.openByUrl(spreadsheetURL).getSheetByName("Sheet1");

// Pauls = 'qk21dncgr5kmjtrnadcu1nrtms@group.calendar.google.com'
var calendarID = '0aq1d9prtas4f998vgspmhufkk@group.calendar.google.com'
var masterCal = CalendarApp.getCalendarById(calendarID);

// function to retrieve data from Sheet and add to Calendar
function simpleSheetsToCalendar() { 
  // get the data from Google Sheet. The three numbers mean: current row, start with column one, end with column 2.
  var dataRow = sheet.getRange(1,1,1,2).getValues();
  
  // Get the date
  var date = dataRow[0][0];
  
  // Get the Event Title
  var title = dataRow[0][1];
  
  exportToCalendar(title,date)
}

function exportToCalendar(title, deadlineDate) {
  myLog("exportToCalendar called")
  title = "DEADLINE " + title
  myLog("title" + title)
  myLog("deadlineDate" + deadlineDate)
  var dateInFiveMinutes = new Date(deadlineDate.getTime() + (1000 * 5 * 60) );
  
  // add to calendar
  var event = masterCal.createEvent(title, deadlineDate, dateInFiveMinutes);
  
  event.addPopupReminder(5)
  event.addSmsReminder(5)
  event.addEmailReminder(5)
  
  myLog('Event ID: ' + event.getId() + " Will Send Reminder at " + event.getEmailReminders());
}

function clearEvents() {
  var fromDate = new Date(new Date(2020, 02, 01));
  var toDate = new Date(new Date(2020, 02, 20));
  Logger.log('fromDate:' + fromDate);
  Logger.log('toDate:' + toDate);
  var events = masterCal.getEvents(fromDate, toDate);
  Logger.log('events.length:' + events.length);
  for(var i=0; i<events.length;i++){
    var ev = events[i];
    Logger.log(ev.getTitle()); // show event name in log
    ev.deleteEvent();
  }
}

function doGet(e) {
  myLog("doGet called")
  var postContents = JSON.parse(e.postData.contents);
  title = postContents.body;
  myLog('title: ' + title);
  
  var title = "This is title"
  var HTMLString = "<h1>Done! " + title + "</h1>";

  HTMLOutput = HtmlService.createHtmlOutput(HTMLString);
  return HTMLOutput
//  return ContentService.createTextOutput('Hello, world!');
}

function doPost(e) {
  var postContents = JSON.parse(e.postData.contents);
  exportToCalendar(postContents.title, new Date(postContents.deadline))
  
  exportList()
  return ContentService.createTextOutput('Done!');
}

function myLog(logLine) {
  var now = new Date()
  sheet.appendRow([now, logLine])
}


function exportToCalendarOLD(title, deadlinedate) {
  title = "DEADLINE " + title
  var minutes = 6
  var now = new Date()
  var dateInSixMinutes = new Date(now.getTime() + (1000 * minutes * 60) );
  
  // add to calendar
  var event = masterCal.createEvent(title, dateInSixMinutes, dateInSixMinutes);
  
  event.addPopupReminder(minutes - 1)
  event.addSmsReminder(minutes - 1)
  event.addEmailReminder(minutes - 1)
  
  Logger.log('Event ID: ' + event.getId() + " Will Send Reminder at " + event.getEmailReminders());
}

function exportList() {
  exportToCalendar("Digital, Culture, Media and Sport (T)", new Date(2020, 1, 10, 12, 30, 0))
  exportToCalendar("Attorney General", new Date(2020, 1, 10, 12, 30, 0))
  exportToCalendar("Housing, Communities and Local Government (T)", new Date(2020, 1, 13, 12, 30, 0))
  exportToCalendar("Justice (T)", new Date(2020, 1, 13, 12, 30, 0))
  exportToCalendar("Prime Minister", new Date(2020, 1, 13, 12, 30, 0))
  exportToCalendar("Wales", new Date(2020, 1, 13, 12, 30, 0))
  exportToCalendar("Chancellor of the Duchy of Lancaster and Minister for the Cabinet Office (T)", new Date(2020, 1, 24, 12, 30, 0))
  exportToCalendar("Education (T)", new Date(2020, 1, 25, 12, 30, 0))
  exportToCalendar("Business, Energy and Industrial Strategy (T)", new Date(2020, 1, 26, 12, 30, 0))
  exportToCalendar("International Development (T)", new Date(2020, 1, 27, 12, 30, 0))
  exportToCalendar("Prime Minister", new Date(2020, 1, 27, 12, 30, 0))
  exportToCalendar("International Trade (T)", new Date(2020, 2, 2, 12, 30, 0))
  exportToCalendar("Work and Pensions (T)", new Date(2020, 2, 3, 12, 30, 0))
  exportToCalendar("Health and Social Care (T)", new Date(2020, 2, 4, 12, 30, 0))
  exportToCalendar("Women and Equalities (T)", new Date(2020, 2, 5, 12, 30, 0))
  exportToCalendar("Prime Minister", new Date(2020, 2, 5, 12, 30, 0))
  exportToCalendar("Transport (T)", new Date(2020, 2, 9, 12, 30, 0))
  exportToCalendar("Defence (T)", new Date(2020, 2, 10, 12, 30, 0))
  exportToCalendar("Northern Ireland", new Date(2020, 2, 10, 12, 30, 0))
  exportToCalendar("Foreign and Commonwealth Office (T)", new Date(2020, 2, 11, 12, 30, 0))
  exportToCalendar("Prime Minister", new Date(2020, 2, 12, 12, 30, 0))         
}

