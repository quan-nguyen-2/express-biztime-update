const express = require('express');
const router = new express.Router();
const db = require('../db');
const ExpressError = require('../expressError');

router.get('/', async (req, res, next) => {
  try {
    const result = await db.query('SELECT code, industry FROM industries');
    return res.json({ industries: result.rows });
  } catch (err) {
    return next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { code, industry } = req.body;
    const result = await db.query(
      'INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry',
      [code, industry]
    );
    return res.status(201).json({ industry: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

router.post('/:comp_code/:ind_code', async (req, res, next) => {
  try {
    const { comp_code, ind_code } = req.params;
    const result = await db.query(
      'INSERT INTO company_industries (comp_code, ind_code) VALUES ($1, $2) RETURNING comp_code, ind_code',
      [comp_code, ind_code]
    );
    return res.status(201).json({ association: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
