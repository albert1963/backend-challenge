import express from 'express';

import categoryRoutes from './routes/category';

const app = express();

app.use(categoryRoutes);
// @ts-ignore
app.use((error, req, res, next ) => { //handle global error
    const status = error.statusCode;
    const message = error.message;
    res.status(status).json({message: message});
});

app.listen(3000);
