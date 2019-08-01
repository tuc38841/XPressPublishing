const express = require('express');
const apiRouter = express.Router();
const artistRouter = require('./artists.js');
const seriesRouter = require('./series');
const issuesRouter = require('./issues');

apiRouter.use('/artist', artistRouter);
apiRouter.use('/series', seriesRouter);
apiRouter.use('/issues', issuesRouter);

module.export = apiRouter;