const express = require('express');
const artistRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

artistRouter.param('/:artistId', (req, res, next, artistId) => {
    db.get('SELECT * FROM Artist WHERE id = $artistId', { $artistId: artistId }, (error, artist) => {
        if (error) {
            next(error);
        } else if (artist) {
            req.artist = artist;
        } else {
            res.sendStatus(404);
        }
    });
});

artistRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Artist WHERE is_currently_employeed = 1', (error, artists) => {
        if (error) {
            next(error);
        } else {
            res.status(200).json({artists: artists});
        }
    });
});

artistRouter.get('/:artistId', (req, res, next, artistId) => {
    res.status(200).json({artist: req.artist});
})

artistRouter.post('/', (req, res, next) => {
    const name = req.body.artist.name;
    const dateOfBirth = req.body.artist.dateOfBirth;
    const biography = req.body.artist.biography;
    const isCurrentlyEmployeed = req.body.artist.isCurrentlyEmployeed === 0 ? 0 : 1;
    const sql = 'INSERT INTO TABLE Artist ($name, #dateOfBirth, $biography, $isCurrentlyEmployeed';
    const values = {
        $name: name,
        $dateOfBirth: dateOfBirth,
        $biography: biography,
        $isCurrentlyEmployeed: isCurrentlyEmployeed
    };
    if (!name || !dateOfBirth || !biography) {
        return res.sendStatus(400);
    }
    db.run(sql, values, function(error) {
        if (error) {
            next(error);
        } else {
            db.run(`SELECT * FROM Artist WHERE id = ${this.lastID}`, (error, artist) => {
                res.end(201).json({artist: artist});
            });
        }
    });
});

artistRouter.put('/:artistId', (req, res, next) => {
    const name = req.body.artist.name;
    const dateOfBirth = req.body.artist.dateOfBirth;
    const biography = req.body.artist.biography;
    const isCurrentlyEmployeed = req.body.artist.isCurrentlyEmployeed === 0 ? 0 : 1;
    const sql = 'UPDATE Artist SET name = $name, date_of_birth = $dateOfBirth, ' + 
   'biography = $biography, is_currently_employeed = $isCurrentlyEmployeed ' + 
   'WHERE artistId = $artistId;'
    const values = {
        $name: name,
        $dateOfBirth: dateOfBirth,
        $biography: biography,
        $isCurrentlyEmployeed: isCurrentlyEmployeed,
        $artistId: req.param.artistId
    };
    if (!name || !dateOfBirth || !biography) {
        return res.sendStatus(400);
    } else {
        db.run(sql, values, function(error) {
            if (error) {
                next(error);
            } else {
                db.get(`SELECT * FROM Artist WHERE id = ${this.lastID}`, (error, artist) => {
                    res.status(200).json({artist: artist});
                });
            }
        });
    }
});

artistRouter.delete('/:artistId', (req, res, next) => {
    const sql = 'UPDATE Artist SET is_currently_employeed = 0 WHERE id = $artistId';
    const values = {$artistId: req.params.artistId};
    db.run(sql, values, function(error) {
        if (error) {
            next(error);
        } else {
            db.get(`SELECT * FROM Artist WHERE id = ${req.params.artistId}`, (error, artist) => {
                res.status(200).json({artist: artist});
            });
        }
    });
});

module.export = artistRouter;