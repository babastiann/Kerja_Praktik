const pool = require("../db");

exports.getAllHouses = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM houses"
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};

exports.createHouse = async (req, res) => {
  try {
    const {
      nama,
      harga,
      lokasi,
      luas_tanah,
      luas_bangunan,
      kamar_tidur,
      kamar_mandi,
    } = req.body;

    const query = `
      INSERT INTO houses
      (
        nama,
        harga,
        lokasi,
        luas_tanah,
        luas_bangunan,
        kamar_tidur,
        kamar_mandi
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *
    `;

    const values = [
      nama,
      harga,
      lokasi,
      luas_tanah,
      luas_bangunan,
      kamar_tidur,
      kamar_mandi,
    ];

    const result = await pool.query(
      query,
      values
    );

    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
};