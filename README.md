# PDF -> Tabling Questions iCal


Parliament publishes a table of when questions and when the deadlines for submitting questions are. It would be useful if an MPs office could subscribe to these via Outlook so not to miss important deadlines.

## Could we parse the PDF?

[Dates And Deadlines For Oral Questions PDF](https://www.parliament.uk/documents/commons-table-office/OralQuestionsRota.pdf)

no, too hard, we lose all the positional data, this needs a human being to parse.

## Could we do Google Sheets -> Google Calendar?

Ok so what if we just have 1 human being enter the detais once and then generate a Google Calendar from it.

Maybe...

[How to add events to a calendar](https://www.quora.com/How-do-I-automatically-add-events-to-a-Google-Calendar-from-a-Google-Sheet?share=1)

###Resources

The 'Parliamentary Deadline' [Google Calender](https://docs.google.com/spreadsheets/d/1lQo7VX_3qOS7_ZbVX-1CVxMVAtACt7gnTGI54o5pd0k/edit?usp=sharing)

The Sheet -> Calendar Script is [here](https://script.google.com/d/17Zbbubuil0VjQOqp_LQUqV1rKwxHtJEmgkSP8_9iizt27OgKLqdrws7t/edit?usp=sharing)

```// function to retrieve data from Sheet and add to Calendar
function simpleSheetsToCalendar() {
  
  // get spreadsheet
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('SHEET1');
  
  // get the data from Google Sheet. The three numbers mean: current row, start with column one, end with column 6.
  var dataRow = sheet.getRange(1,1,1,2).getValues();
  
  // Get the date
  var date = dataRow[0][0];
  
  // Get the Event Title
  var title = "DEADLINE" + " " + dataRow[0][1];
  
  exportToCalendar(title,date)
  
}

function exportToCalendar(title, deadlinedate) {
 
  var minutes = 6
  var now = new Date()
  var dateInSixMinutes = new Date(now.getTime() + (1000 * minutes * 60) );
  
  // get calendar
  var masterCal = CalendarApp.getCalendarById('qk21dncgr5kmjtrnadcu1nrtms@group.calendar.google.com');
  
  // add to calendar
  var event = masterCal.createEvent(title, dateInSixMinutes, dateInSixMinutes);
  
  event.addPopupReminder(minutes - 1)
  event.addSmsReminder(minutes - 1)
  event.addEmailReminder(minutes - 1)
  
  Logger.log('Event ID: ' + event.getId() + " Will Send Reminder at " + event.getEmailReminders() ) ;
 
}```