import { Router } from 'express';
import { pool } from '../db.js';
import { mapCityRow } from '../utils.js';

const router = Router();

// 获取所有城市
router.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM cities ORDER BY overall_score DESC');
    const cities = (rows as any[]).map(mapCityRow);
    res.json(cities);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 获取单个城市
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM cities WHERE id = ?', [req.params.id]);
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: '城市不存在' });
    }
    res.json(mapCityRow((rows as any[])[0]));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 新增城市
router.post('/', async (req, res) => {
  try {
    const b = req.body;
    const id = String(Date.now());
    const tags = JSON.stringify(b.tags || []);
    await pool.query(
      `INSERT INTO cities (id, name, province, level, image, banner_image, description, overall_score, housing_price, average_salary, price_level, education_score, medical_score, transportation_score, employment_score, air_quality_score, greening_score, life_pace_score, climate_score, tags, is_coastal, has_mountains, is_historical)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, b.name, b.province, b.level, b.image, b.bannerImage, b.description,
       b.overallScore, b.housingPrice, b.averageSalary, b.priceLevel,
       b.educationScore, b.medicalScore, b.transportationScore, b.employmentScore,
       b.airQualityScore, b.greeningScore, b.lifePaceScore, b.climateScore,
       tags, b.isCoastal, b.hasMountains, b.isHistorical]
    );
    const [rows] = await pool.query('SELECT * FROM cities WHERE id = ?', [id]);
    res.status(201).json(mapCityRow((rows as any[])[0]));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 更新城市
router.put('/:id', async (req, res) => {
  try {
    const b = req.body;
    const tags = JSON.stringify(b.tags || []);
    await pool.query(
      `UPDATE cities SET name=?, province=?, level=?, image=?, banner_image=?, description=?, overall_score=?, housing_price=?, average_salary=?, price_level=?, education_score=?, medical_score=?, transportation_score=?, employment_score=?, air_quality_score=?, greening_score=?, life_pace_score=?, climate_score=?, tags=?, is_coastal=?, has_mountains=?, is_historical=? WHERE id=?`,
      [b.name, b.province, b.level, b.image, b.bannerImage, b.description,
       b.overallScore, b.housingPrice, b.averageSalary, b.priceLevel,
       b.educationScore, b.medicalScore, b.transportationScore, b.employmentScore,
       b.airQualityScore, b.greeningScore, b.lifePaceScore, b.climateScore,
       tags, b.isCoastal, b.hasMountains, b.isHistorical, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM cities WHERE id = ?', [req.params.id]);
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: '城市不存在' });
    }
    res.json(mapCityRow((rows as any[])[0]));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 删除城市
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM cities WHERE id = ?', [req.params.id]);
    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: '城市不存在' });
    }
    res.json({ message: '删除成功' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
