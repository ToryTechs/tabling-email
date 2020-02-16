const PORT = process.env.PORT || 12180;

import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import logger from 'morgan';

import { getIcal } from './pdf';

const app = express();
app.use(logger('tiny'))

app.get('/ical', expressAsyncHandler(async (req, res) => {
    const cal = await getIcal();
    cal.serve(res);
}));

app.listen(PORT, () => {
    console.info(`Listening on port [${PORT}]`);
});
