import express from 'express';

const path = '/';
const router = express.Router();

router.get('', (req, res) => {
    res.render('index', {
        // variables to be passed to the views go here
    });
});

export default {
    path,
    router,
};
