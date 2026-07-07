const express = require('express');
const router = express.Router();

router.get('/requests', (req, res) => {
    res.json({ success: true, requests: [] });
});

module.exports = router;