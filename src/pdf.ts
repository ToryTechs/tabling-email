///<reference path="./types.d.ts" />

import { writeFileSync } from 'fs';
import { join } from 'path';
import pdf2html from 'pdf2html';
import ical from 'ical-generator';
import moment from 'moment';
import { tmpdir } from 'os';
import axios from 'axios';

const dayNames = 'MondayTuesdayWednesdayThursdayFridaySaturdaySunday'

const rotaUrl = `https://www.parliament.uk/documents/commons-table-office/OralQuestionsRota.pdf`;
let rotaLastFetched: number;

const threeHours = 1000 * 60 * 60 * 3;
function getPdfPath() {
    const pdfPath = join(tmpdir(), 'OralQuestionsRota.pdf');
    return new Promise(async (resolve, reject) => {
        if (rotaLastFetched && (rotaLastFetched > (Date.now() - threeHours))) {
            console.log(`Reusing PDF file from [${new Date(rotaLastFetched)}]`);
            resolve(pdfPath);
        } else {
            console.log(`Fetching PDF from [${rotaUrl}]`);
            const resp = await axios({ url: rotaUrl, method: 'get', responseType: "arraybuffer" });
            writeFileSync(pdfPath, resp.data);
            resolve(pdfPath);
        }
    });
}

export function getIcal(): Promise<ical.ICalCalendar> {
    return new Promise(async (resolve, reject) => {
        const pdfPath = await getPdfPath();

        pdf2html.text(
            pdfPath,
            (err: any, text: string) => {
                if (err) {
                    console.error(`Failed to extract text:`, err);
                    reject(err);
                    return;
                }

                const weeks = text.split('Monday ').slice(1).map(txt => 'Monday ' + txt);
                const weeksData = weeks.map((week) => {
                    const dates = week.split('\n')[0].split(' ').reduce((acc: string[], word: string) => {
                        if (dayNames.includes(word)) {
                            acc.push(word);
                        } else {
                            acc[acc.length - 1] += ' ' + word;
                        }
                        return acc;
                    }, []);
                    const questionTime = week.split('\n').slice(1).join('\n').split('Deadline at')[0].trim().split('\n\n');
                    const deadlines = week
                        .replace(/\(T\)/g, '')
                        .split('Deadline at')[1]
                        .split('\n\n')
                        .slice(1)
                        .join('\n\n')
                        .trim()
                        .split('\n\n')
                        .flatMap(group => group.split('No deadline this day'))
                        .map(text => text.trim())
                        .map(text => {
                            const lines = text.split(/\)\s*\n/g).map((t, i, arr) => (i < (arr.length - 1) ? t + ')' : t).trim()).filter(a => a);
                            return lines.map((line) => {
                                const matches = line.match(/\([A-z0-9\s]*\)$/);
                                if (!matches) {
                                    throw new Error(`Couldn't find date`);
                                }
                                const _date = matches[0];
                                const name = line.split(_date)[0].trim();
                                const date = _date.slice(1, -1);
                                return {
                                    name, date
                                }
                            });
                        });

                    return dates.reduce((acc: any, date, index) => {
                        acc[date] = {
                            questionTimme: questionTime[index],
                            deadlines: deadlines[index],
                        };
                        return acc;
                    }, {})
                });

                const cal = ical({ name: 'Oral Questions Rota' });

                for (const week of weeksData) {
                    for (const [date, { deadlines }] of Object.entries(week) as any) {
                        const [_, day, month] = date.split(' ');
                        const mDate = moment().set('date', Number(day)).set('month', month).set('hour', 12).set('minute', 0).set('second', 0).set('millisecond', 0);

                        for (const deadline of deadlines) {
                            cal.createEvent({
                                start: mDate,
                                end: mDate.add(30, 'minute'),
                                summary: deadline.name.replace(/\n/g, ''),
                                description: `This question will be answered on ${deadline.date}`,
                            });
                        }
                    }
                }

                resolve(cal);
            }
        );
    });
}