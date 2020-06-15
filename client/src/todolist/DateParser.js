// only call this function if a date hasn't already been parsed from the string in TodoList

export default function DateParser(str) {
  const spokenWords = [
    "today",
    "tomorrow",
    "yesterday",
    "tmr",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const months = [
    "january",
    "jan",
    "february",
    "feb",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "aug",
    "september",
    "sep",
    "october",
    "oct",
    "november",
    "nov",
    "december",
    "dec",
  ];

  const daysWithSuffix = [
    "1st",
    "2nd",
    "3rd",
    "4th",
    "5th",
    "6th",
    "7th",
    "8th",
    "9th",
    "10th",
    "11th",
    "12th",
    "13th",
    "14th",
    "15th",
    "16th",
    "17th",
    "18th",
    "19th",
    "20th",
    "21st",
    "22nd",
    "23rd",
    "24th",
    "25th",
    "26th",
    "27th",
    "28th",
    "29th",
    "30th",
    "31st",
  ];

  var words = str.toLowerCase().split(" ");

  var isSpokenWord = false;
  var isStringDate = false;
  var monthBeforeDay = null;
  var keywords = "";
  var month = "";
  var monthCandidates = [];
  var day = "";

  // search for any occurences of commonly spoken words
  for (let i = 0; i < words.length; i++) {
    var word = words[i];
    if (spokenWords.indexOf(word) !== -1) {
      keywords = word;
      isSpokenWord = true;
      break;
    }
  }

  // if we don't find any commonly spoken words, look for string representations of dates
  if (isSpokenWord === false) {
    // look for months
    for (let i = 0; i < words.length; i++) {
      let word = words[i];
      if (months.indexOf(word) !== -1) {
        monthCandidates.push(word);
      }
    }

    // if we found a month, look on either side of it for a date
    if (monthCandidates.length > 0) {
      // check each month candidate
      for (let f = 0; f < monthCandidates.length; f++) {
        var monthCandidate = monthCandidates[f];
        const monthIndex = getPosition(words, monthCandidate, f + 1);
        var dateCandidates = [];
        if (monthIndex - 1 >= 0)
          dateCandidates.push({
            index: monthIndex - 1,
            date: words[monthIndex - 1],
          });
        if (monthIndex + 1 < words.length)
          dateCandidates.push({
            index: monthIndex + 1,
            date: words[monthIndex + 1],
          });

        // check to see if either of these dateCandidates are actual dates with suffixes
        for (let i = 0; i < dateCandidates.length; i++) {
          const dateCandidate = dateCandidates[i].date;
          const idx = dateCandidates[i].index;
          if (daysWithSuffix.indexOf(dateCandidate) !== -1) {
            day = dateCandidate;
            if (idx > monthIndex) monthBeforeDay = true;
            else monthBeforeDay = false;
            break;
          }
        }

        // if nothing was found, then we look for numeric representations
        if (day === "") {
          for (let i = 0; i < dateCandidates.length; i++) {
            const dateCandidate = parseInt(dateCandidates[i].date);
            const idx = dateCandidates[i].index;
            if (dateCandidate > 0 && dateCandidate <= 31) {
              day = dateCandidate;
              if (idx > monthIndex) monthBeforeDay = true;
              else monthBeforeDay = false;
              break;
            }
          }
        }

        // if we found a date, then we have a date value
        if (day !== "") {
          isStringDate = true;
          month = monthCandidates[f];
          break;
        }
      }
    }
  }

  var today = new Date();
  var currYear = today.getFullYear();
  var currMonth = today.getMonth() + 1;
  var currDate = today.getDate();
  var currDayOfTheWeek = today.getDay() + 1;

  // create and return the parsed date
  if (!isSpokenWord && !isStringDate) return { date: "", keywords: "" };
  // no date found
  else if (isSpokenWord && !isStringDate) {
    if (keywords === "today") {
      return {
        date: getFormattedDate(currYear, currMonth, currDate),
        keywords: keywords,
      };
    } else if (keywords === "yesterday") {
      var yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        date: getFormattedDate(
          yesterday.getFullYear(),
          yesterday.getMonth() + 1,
          yesterday.getDate()
        ),
        keywords: keywords,
      };
    } else if (keywords === "tomorrow" || keywords === "tmr") {
      var tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return {
        date: getFormattedDate(
          tomorrow.getFullYear(),
          tomorrow.getMonth() + 1,
          tomorrow.getDate()
        ),
        keywords: keywords,
      };
    } else {
      var dayOfTheWeek = dayOfTheWeekToNumber(keywords); // always going to assume its the next upcoming day
      var difference = distanceToNextDay(currDayOfTheWeek, dayOfTheWeek);
      var nextGivenDay = new Date();
      nextGivenDay.setDate(nextGivenDay.getDate() + difference);

      return {
        date: getFormattedDate(
          nextGivenDay.getFullYear(),
          nextGivenDay.getMonth() + 1,
          nextGivenDay.getDate()
        ),
        keywords: keywords,
      };
    }
  } else if (isStringDate && !isSpokenWord) {
    var currDay = today.getDate();

    var monthNum = convertMonthToNumber(month);
    var dayNum = parseInt(day);

    var year = currYear;
    if (monthNum < currMonth) year = currYear + 1;
    else if (monthNum === currMonth) {
      if (dayNum < currDay) year = currYear + 1;
    } else year = currYear;

    var keywordsToReturn = monthBeforeDay
      ? month + " " + day
      : day + " " + month;

    return {
      date: getFormattedDate(year, monthNum, dayNum),
      keywords: keywordsToReturn,
    };
  }
}

function convertMonthToNumber(month) {
  if (month === "jan") return 1;
  if (month === "feb") return 2;
  if (month === "aug") return 8;
  if (month === "sep") return 9;
  if (month === "oct") return 10;
  if (month === "nov") return 11;
  if (month === "dec") return 12;

  const months = [
    "",
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ];

  return months.indexOf(month);
}

function dayOfTheWeekToNumber(dayOfTheWeek) {
  const daysOfTheWeek = [
    "",
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  return daysOfTheWeek.indexOf(dayOfTheWeek);
}

function distanceToNextDay(day1, day2) {
  var diff = 7 - day1 + day2;
  if (diff !== 7) diff %= 7;
  return diff;
}

function getFormattedDate(year, month, day) {
  if (month < 10) month = "0" + month.toString();
  if (day < 10) day = "0" + day.toString();

  return year + "-" + month + "-" + day;
}

function getPosition(array, entry, occurence) {
  var seen = 0;
  for (let i = 0; i < array.length; i++) {
    if (array[i] === entry) {
      seen++;
      if (seen === occurence) return i;
    }
  }
  if (seen === 1) return array.indexOf(entry);
}

// console.log(DateParser("go to italy sep 10"));
