"use strict";
///<reference path="./types.d.ts" />
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var pdf2html_1 = __importDefault(require("pdf2html"));
var ical_generator_1 = __importDefault(require("ical-generator"));
var moment_1 = __importDefault(require("moment"));
var dayNames = 'MondayTuesdayWednesdayThursdayFridaySaturdaySunday';
function getIcal() {
    return new Promise(function (resolve, reject) {
        pdf2html_1.default.text(path_1.join(process.cwd(), 'OralQuestionsRota.pdf'), function (err, text) {
            if (err) {
                console.error("Failed to extract text:", err);
                reject(err);
                return;
            }
            var weeks = text.split('Monday ').slice(1).map(function (txt) { return 'Monday ' + txt; });
            var weeksData = weeks.map(function (week) {
                var dates = week.split('\n')[0].split(' ').reduce(function (acc, word) {
                    if (dayNames.includes(word)) {
                        acc.push(word);
                    }
                    else {
                        acc[acc.length - 1] += ' ' + word;
                    }
                    return acc;
                }, []);
                var questionTime = week.split('\n').slice(1).join('\n').split('Deadline at')[0].trim().split('\n\n');
                var deadlines = week
                    .replace(/\(T\)/g, '')
                    .split('Deadline at')[1]
                    .split('\n\n')
                    .slice(1)
                    .join('\n\n')
                    .trim()
                    .split('\n\n')
                    .flatMap(function (group) { return group.split('No deadline this day'); })
                    .map(function (text) { return text.trim(); })
                    .map(function (text) {
                    var lines = text.split(/\)\s*\n/g).map(function (t, i, arr) { return (i < (arr.length - 1) ? t + ')' : t).trim(); }).filter(function (a) { return a; });
                    return lines.map(function (line) {
                        var matches = line.match(/\([A-z0-9\s]*\)$/);
                        if (!matches) {
                            throw new Error("Couldn't find date");
                        }
                        var _date = matches[0];
                        var name = line.split(_date)[0].trim();
                        var date = _date.slice(1, -1);
                        return {
                            name: name, date: date
                        };
                    });
                });
                return dates.reduce(function (acc, date, index) {
                    acc[date] = {
                        questionTimme: questionTime[index],
                        deadlines: deadlines[index],
                    };
                    return acc;
                }, {});
            });
            var cal = ical_generator_1.default({ name: 'Oral Questions Rota' });
            for (var _i = 0, weeksData_1 = weeksData; _i < weeksData_1.length; _i++) {
                var week = weeksData_1[_i];
                for (var _a = 0, _b = Object.entries(week); _a < _b.length; _a++) {
                    var _c = _b[_a], date = _c[0], deadlines = _c[1].deadlines;
                    var _d = date.split(' '), _ = _d[0], day = _d[1], month = _d[2];
                    var mDate = moment_1.default().set('date', Number(day)).set('month', month).set('hour', 12).set('minute', 0).set('second', 0).set('millisecond', 0);
                    for (var _e = 0, deadlines_1 = deadlines; _e < deadlines_1.length; _e++) {
                        var deadline = deadlines_1[_e];
                        cal.createEvent({
                            start: mDate,
                            end: mDate.add(30, 'minute'),
                            summary: deadline.name.replace(/\n/g, ''),
                            description: "This question will be answered on " + deadline.date,
                        });
                    }
                }
            }
            resolve(cal);
        });
    });
}
exports.getIcal = getIcal;
