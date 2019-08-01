const express = require('express');
const seriesRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const issuesRouter = require('./issues');

seriesRouter.param('seriesId', (req, res, next) => {
    const sql = 'SELECT * FROM Series WHERE id = $seriesId';
    const values = {$seriesId: $seriesId};
    db.get(sql, values, (error, series) => {
        if (error) {
            next(error);
        } else if (seriesId) {
            req.series = series;
            next();
        } else {
            res.sendStatus(404);
        }
    })
})

seriesRouter.use('/:seriesId/issues', issuesRouter);

seriesRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Series', (err, series) => {
        if (err) {
            next(err);
        } else {
            res.send(200).json({series: series});
        }
    });
});

seriesRouter.get('/:seriesId', (req, res, next) => {
    res.status(200).json({series: req.series});
});

seriesRouter.post('/', (req, res, next) => {
    const name = req.body.series.name;
    const description = req.body.series.description;
    const sql = 'INSERT INTO Series (name, description) VALUES ($name, $description)';
    const values = {$name: name, $description: description};
    if (!name || !description) {
        return res.sendStatus(400);
    } else {
        db.run(sql, values, function(error) {
            if (error) {
                next(err);
            } else {
                db.get(`SELECT * FROM Series WHERE id = ${this.lastID}`, (error, series) => {
                    res.status(201).json({series: series})
                });
            }
        });
    }
});

seriesRouter.put('/:seriesId', (req, res, next) => {
    const name = req.body.series.name;
    const description = req.body.series.description;
    const sql = 'UPDATE Series SET name = $name,  description = $description) WHERE id = $seriesId';
    const values = {$name: name, $description: description, $seriesId: req.param.seriesId};

    db.run(sql, values, (error) => {
        if (error) {
            next(error);
        } else {
            db.get(`SELECT * FROM Series WHERE id = ${req.params.seriesId}`, (error, series) => {
                res.status(200).json({series: series});
            });
        }
    });
});
    
seriesRouter.delete('/:seriesId', (req, res, next) => {
    const issueSql = 'SELECT * FROM Issue WHERE Issue.id = $seriesId';
    const values = {$seriesId: req.params.seriesId};
    db.get(issueSql, values, (error, issue) => {
        if (error) {
            next(error);
        } else if (issue) {
            res.sendStatus(400);
        } else {
            const deleteSql = 'DELETE FROM Series WHERE Series.id = $seriesId';
            const deleteValues = {$seriesId: req.params.seriesId};
            db.run(deleteSql, deleteValues, (error) => {
                if (error) {
                    next(error);
                } else {
                    res.sendStatus(204);
                }
            })
        }
    })
});

module.exports = seriesRouter;