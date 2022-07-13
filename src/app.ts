import path from 'path';

import bodyParser from 'body-parser';
import express from 'express';
import glob from 'glob';
import compression from 'compression';

import { Route } from './types/Route.type';
import locals from './utils/locals';

const app = express();
const port = process.env.SERVER_PORT;


app.use(bodyParser.json());
app.use(compression());

app.locals = locals;

const ROUTES_PATH = path.join(__dirname, '/routes');
const files = glob.sync(path.join(ROUTES_PATH, '/**/*.js'));

files.forEach((file) => {
    const basePath = path.basename(file);
    // eslint-disable-next-line
    const route = require(`./routes/${basePath}`) as { default: Route };

    const { path: foundPath } = route.default;
    const { router: foundRouter } = route.default;

    // eslint-disable-next-line no-console
    console.log(`Initializing route: ${basePath}`);
    app.use(foundPath, foundRouter);
});

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server started, listening at http://localhost:${port}`);
});
