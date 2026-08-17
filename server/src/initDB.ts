import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 从 .env 文件读取配置
function loadEnv() {
  try {
    const envContent = readFileSync(join(__dirname, '..', '.env'), 'utf-8');
    envContent.split('\n').forEach(line => {
      line = line.trim();
      if (!line || line.startsWith('#')) return;
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim();
      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    });
  } catch (e) {
    console.log('未找到 .env 文件，使用默认配置');
  }
}

loadEnv();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306');
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '123456';
const DB_NAME = process.env.DB_NAME || 'ruyi_city';

async function initDatabase() {
  console.log('🔧 开始初始化数据库...');

  // 先不指定数据库创建连接，用于创建数据库
  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    multipleStatements: true,
  });

  // 创建数据库
  await connection.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME} DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  console.log(`✅ 数据库 ${DB_NAME} 已创建`);

  await connection.query(`USE ${DB_NAME}`);

  // 创建表
  console.log('📋 创建数据表...');

  // 城市表
  await connection.query(`
    CREATE TABLE IF NOT EXISTS cities (
      id VARCHAR(32) PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      province VARCHAR(50) NOT NULL,
      level ENUM('first-tier','new-first-tier','second-tier','third-fourth-tier') NOT NULL DEFAULT 'second-tier',
      image TEXT,
      banner_image TEXT,
      description TEXT,
      overall_score DECIMAL(3,1) NOT NULL DEFAULT 8.0,
      housing_price INT NOT NULL DEFAULT 20000,
      average_salary INT NOT NULL DEFAULT 8000,
      price_level DECIMAL(3,1) NOT NULL DEFAULT 6.0,
      education_score DECIMAL(3,1) NOT NULL DEFAULT 7.0,
      medical_score DECIMAL(3,1) NOT NULL DEFAULT 7.0,
      transportation_score DECIMAL(3,1) NOT NULL DEFAULT 7.0,
      employment_score DECIMAL(3,1) NOT NULL DEFAULT 7.0,
      air_quality_score DECIMAL(3,1) NOT NULL DEFAULT 7.0,
      greening_score DECIMAL(3,1) NOT NULL DEFAULT 7.0,
      life_pace_score DECIMAL(3,1) NOT NULL DEFAULT 6.0,
      climate_score DECIMAL(3,1) NOT NULL DEFAULT 7.0,
      tags JSON,
      is_coastal BOOLEAN NOT NULL DEFAULT FALSE,
      has_mountains BOOLEAN NOT NULL DEFAULT FALSE,
      is_historical BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('  ✅ cities 表已创建');

  // 用户表
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(32) PRIMARY KEY,
      username VARCHAR(50) NOT NULL,
      phone VARCHAR(20) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL DEFAULT '',
      avatar TEXT,
      favorites JSON,
      is_disabled BOOLEAN NOT NULL DEFAULT FALSE,
      created_at DATE NOT NULL DEFAULT (CURRENT_DATE)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('  ✅ users 表已创建');

  // 评价表
  await connection.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id VARCHAR(32) PRIMARY KEY,
      user_id VARCHAR(32) NOT NULL,
      username VARCHAR(50) NOT NULL,
      user_avatar TEXT,
      city_id VARCHAR(32) NOT NULL,
      rating INT NOT NULL DEFAULT 5,
      content TEXT,
      is_approved BOOLEAN NOT NULL DEFAULT FALSE,
      created_at DATE NOT NULL DEFAULT (CURRENT_DATE),
      INDEX idx_city (city_id),
      INDEX idx_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('  ✅ reviews 表已创建');

  // 公告表
  await connection.query(`
    CREATE TABLE IF NOT EXISTS announcements (
      id VARCHAR(32) PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      content TEXT NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at DATE NOT NULL DEFAULT (CURRENT_DATE)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('  ✅ announcements 表已创建');

  // 管理员表
  await connection.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id VARCHAR(32) PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('  ✅ admins 表已创建');

  // 社区笔记表
  await connection.query(`
    CREATE TABLE IF NOT EXISTS notes (
      id VARCHAR(32) PRIMARY KEY,
      user_id VARCHAR(32) NOT NULL,
      username VARCHAR(50) NOT NULL,
      user_avatar TEXT,
      city_id VARCHAR(32) NOT NULL,
      city_name VARCHAR(50) NOT NULL,
      title VARCHAR(200) NOT NULL,
      content TEXT NOT NULL,
      images JSON,
      like_count INT NOT NULL DEFAULT 0,
      comment_count INT NOT NULL DEFAULT 0,
      view_count INT NOT NULL DEFAULT 0,
      is_approved BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_city (city_id),
      INDEX idx_user (user_id),
      INDEX idx_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('  ✅ notes 表已创建');

  // 笔记点赞表（用于防重复点赞）
  await connection.query(`
    CREATE TABLE IF NOT EXISTS note_likes (
      id VARCHAR(32) PRIMARY KEY,
      note_id VARCHAR(32) NOT NULL,
      user_id VARCHAR(32) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_note_user (note_id, user_id),
      INDEX idx_note (note_id),
      INDEX idx_user (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('  ✅ note_likes 表已创建');

  // 导入初始数据
  console.log('\n📦 导入初始数据...');

  // 检查是否已有数据
  const [cityRows] = await connection.query('SELECT COUNT(*) as count FROM cities');
  if ((cityRows as any)[0].count === 0) {
    const cities = [
      ['1','杭州','浙江','new-first-tier','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=800&q=80','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=1920&q=80','杭州是浙江省省会，素有"人间天堂"的美誉。西湖美景、互联网产业发达、生活品质高，是新一线城市中的宜居典范。',9.2,42000,12500,7.5,8.8,8.5,9.0,9.2,7.8,9.0,6.5,7.5,'["环境优","就业好","互联网"]',false,true,true],
      ['2','成都','四川','new-first-tier','https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=800&q=80','https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=1920&q=80','成都，四川省省会，天府之国。美食天堂、生活节奏慢、房价适中、幸福感爆棚，是年轻人向往的宜居城市。',8.9,18000,9500,6.0,8.2,8.5,8.0,8.5,7.0,8.0,3.5,7.0,'["美食多","慢生活","低房价"]',false,true,true],
      ['3','青岛','山东','new-first-tier','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=800&q=80','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=1920&q=80','青岛，美丽的海滨城市，红瓦绿树、碧海蓝天。啤酒之城、海洋科技发达、气候宜人，是北方最宜居的城市之一。',8.7,22000,8500,6.5,7.5,7.8,7.5,7.5,8.8,8.5,5.5,8.0,'["靠海","环境优","气候好"]',true,true,false],
      ['4','厦门','福建','second-tier','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=800&q=80','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=1920&q=80','厦门，海上花园城市。鼓浪屿、环岛路、闽南风情，环境优美、气候温暖、文艺气息浓厚，是旅游和居住的理想之地。',8.5,48000,8000,7.0,7.0,7.2,7.0,6.8,9.2,8.8,5.0,8.5,'["靠海","环境优","文艺"]',true,true,false],
      ['5','苏州','江苏','new-first-tier','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=800&q=80','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=1920&q=80','苏州，园林之城，江南水乡代表。紧邻上海、经济发达、环境优美、底蕴深厚，是"上有天堂下有苏杭"的宜居之城。',9.0,28000,10500,7.0,8.5,8.2,8.8,8.8,7.5,8.5,6.0,7.5,'["环境优","就业好","历史名城"]',false,false,true],
      ['6','珠海','广东','second-tier','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=800&q=80','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=1920&q=80','珠海，粤港澳大湾区重要节点城市。百岛之市、环境优美、空气清新、毗邻澳门，是珠三角最宜居的城市之一。',8.6,25000,9000,7.0,7.0,7.5,7.2,7.2,9.0,8.8,5.5,8.2,'["靠海","环境优","空气好"]',true,false,false],
      ['7','西安','陕西','new-first-tier','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=800&q=80','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=1920&q=80','西安，十三朝古都，历史文化名城。高校云集、科教资源丰富、房价亲民、美食众多，是西北地区的核心城市。',8.3,15000,8000,5.5,8.8,8.2,8.0,7.8,6.5,7.0,6.0,6.5,'["低房价","教育强","历史名城"]',false,true,true],
      ['8','南京','江苏','new-first-tier','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=800&q=80','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=1920&q=80','南京，六朝古都，江苏省省会。教育资源雄厚、医疗水平高、绿化覆盖率高、人文气息浓郁，是长三角宜居之城。',8.8,32000,11000,7.2,9.2,9.0,8.5,8.5,7.2,8.8,6.5,7.2,'["教育强","医疗好","历史名城"]',false,true,true],
      ['9','重庆','重庆','new-first-tier','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=800&q=80','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=1920&q=80','重庆，山城、雾都，直辖市。8D魔幻城市、美食之都、房价友好、发展迅猛，是西南地区最具活力的城市。',8.2,13000,8500,5.8,7.8,8.2,8.5,8.0,6.8,7.5,5.5,6.8,'["低房价","美食多","山水之城"]',false,true,true],
      ['10','昆明','云南','second-tier','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=800&q=80','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=1920&q=80','昆明，春城，云南省省会。四季如春、气候宜人、鲜花常开、空气清新，是最适合养老和避寒避暑的城市。',8.4,14000,7000,5.5,6.8,7.2,6.5,6.5,9.5,8.5,4.5,9.8,'["气候好","环境优","适合养老"]',false,true,false],
      ['11','上海','上海','first-tier','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=800&q=80','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=1920&q=80','上海，国际化大都市，中国经济中心。机会最多、资源最丰富、交通最便利，但房价高、生活节奏快、压力大。',8.5,68000,15000,9.0,9.5,9.8,9.8,9.8,6.5,7.5,9.5,7.0,'["就业机会多","教育强","医疗好"]',true,false,true],
      ['12','深圳','广东','first-tier','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=800&q=80','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=1920&q=80','深圳，创新之都，中国硅谷。年轻有活力、科技企业云集、高薪机会多，但房价高企、生活节奏快、教育医疗资源相对不足。',8.3,72000,14500,8.8,7.5,8.0,9.0,9.7,7.8,8.0,9.8,7.8,'["就业机会多","靠海","创新之城"]',true,false,false],
      ['13','长沙','湖南','new-first-tier','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=800&q=80','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=1920&q=80','长沙，湖南省省会，娱乐之都。房价亲民、美食丰富、娱乐产业发达、幸福感高，是新一线城市中的性价比之王。',8.5,11000,8500,5.5,8.0,7.8,7.8,7.8,7.2,7.8,5.5,7.0,'["低房价","美食多","娱乐之都"]',false,false,true],
      ['14','武汉','湖北','new-first-tier','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=800&q=80','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=1920&q=80','武汉，九省通衢，湖北省省会。高校云集、科教实力强、交通枢纽、产业基础雄厚，是中部地区的核心城市。',8.4,16000,9500,6.0,9.0,8.8,9.0,8.2,6.8,7.5,7.0,6.5,'["教育强","交通便利","性价比高"]',false,false,true],
      ['15','大连','辽宁','second-tier','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=800&q=80','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=1920&q=80','大连，北方明珠，辽宁省副省级城市。海滨城市、环境优美、夏季凉爽、建筑有特色，是东北最宜居的城市之一。',8.0,15000,7500,6.0,7.2,7.5,7.0,6.8,8.8,8.2,5.5,7.5,'["靠海","环境优","北方宜居"]',true,true,false],
      ['16','三亚','海南','third-fourth-tier','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=800&q=80','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=1920&q=80','三亚，东方夏威夷。热带海滨风景、椰林沙滩、冬季避寒胜地，虽然城市配套一般，但自然环境无与伦比。',7.8,35000,6000,7.5,5.5,6.0,5.5,5.0,9.9,9.0,3.5,9.0,'["靠海","环境优","适合养老"]',true,true,false],
      ['17','宁波','浙江','new-first-tier','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=800&q=80','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=1920&q=80','宁波，浙江省副省级市，计划单列市。港口城市、经济发达、藏富于民、环境不错，是长三角的重要城市。',8.5,26000,10000,6.8,7.5,7.8,8.0,8.5,7.8,8.0,6.5,7.5,'["经济发达","靠海","环境好"]',true,true,true],
      ['18','合肥','安徽','new-first-tier','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=800&q=80','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=1920&q=80','合肥，安徽省省会，科创之城。近年来发展迅猛、科技产业聚集、房价相对友好、教育资源不错，是中部崛起的代表城市。',8.2,18000,9000,6.0,8.2,7.8,7.5,8.0,7.0,7.5,6.5,7.0,'["发展快","科创之城","性价比高"]',false,false,true],
      ['19','贵阳','贵州','second-tier','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=800&q=80','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=1920&q=80','贵阳，贵州省省会，林城、筑城。夏季凉爽、空气清新、房价低、大数据产业发展迅速，是西南地区的宜居城市。',7.9,9500,6500,5.0,6.5,6.8,6.5,6.5,9.0,8.5,4.5,8.5,'["低房价","夏天凉爽","环境好"]',false,true,false],
      ['20','济南','山东','new-first-tier','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=800&q=80','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=1920&q=80','济南，山东省省会，泉城。历史文化名城、泉水众多、生活节奏适中、教育医疗资源丰富，是山东省的政治文化中心。',8.0,17000,8000,6.2,8.2,8.5,7.5,7.5,6.8,7.5,6.0,6.8,'["教育强","医疗好","泉城"]',false,true,true],
      ['21','无锡','江苏','new-first-tier','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=800&q=80','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=1920&q=80','无锡，太湖明珠，江苏省地级市。经济发达、民营经济活跃、环境优美、紧邻苏州上海，是长三角的宜居之城。',8.6,20000,9500,6.5,7.8,7.8,8.0,8.5,7.5,8.2,6.0,7.5,'["经济发达","环境好","太湖明珠"]',false,true,true],
      ['22','福州','福建','second-tier','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=800&q=80','https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=1920&q=80','福州，福建省省会，榕城。海滨城市、空气清新、美食众多、生活节奏适中，是东南沿海的宜居城市。',8.1,22000,8000,6.5,7.2,7.5,7.0,7.2,8.8,8.0,5.5,8.0,'["靠海","空气好","美食多"]',true,true,true],
    ];

    for (const c of cities) {
      await connection.query(
        `INSERT INTO cities (id, name, province, level, image, banner_image, description, overall_score, housing_price, average_salary, price_level, education_score, medical_score, transportation_score, employment_score, air_quality_score, greening_score, life_pace_score, climate_score, tags, is_coastal, has_mountains, is_historical)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        c
      );
    }
    console.log(`  ✅ 已导入 ${cities.length} 个城市数据`);
  } else {
    console.log(`  ⏭️  城市数据已存在，跳过 (${(cityRows as any)[0].count} 条)`);
  }

  // 导入用户数据
  const [userRows] = await connection.query('SELECT COUNT(*) as count FROM users');
  if ((userRows as any)[0].count === 0) {
    await connection.query(
      `INSERT INTO users (id, username, phone, password, avatar, favorites, is_disabled, created_at) VALUES (?,?,?,?,?,?,?,?)`,
      ['1','如意用户','13800138000','','https://api.dicebear.com/7.x/avataaars/svg?seed=ruyi','["1","2","5"]',false,'2024-01-01']
    );
    console.log('  ✅ 已导入用户数据');
  } else {
    console.log('  ⏭️  用户数据已存在，跳过');
  }

  // 导入评价数据
  const [reviewRows] = await connection.query('SELECT COUNT(*) as count FROM reviews');
  if ((reviewRows as any)[0].count === 0) {
    const reviews = [
      ['1','1','小明','https://api.dicebear.com/7.x/avataaars/svg?seed=xiaoming','1',5,'杭州真的太美了！西湖边散步非常惬意，互联网公司也多，工作机会不少。就是房价有点高，但相比北上广深还是好很多。',true,'2024-01-15'],
      ['2','2','安居客','https://api.dicebear.com/7.x/avataaars/svg?seed=anjuke','1',4,'在杭州生活了5年，整体很满意。绿化好，空气也还行，就是夏天太热了，梅雨季也挺难受的。',true,'2024-02-20'],
      ['3','3','吃货一枚','https://api.dicebear.com/7.x/avataaars/svg?seed=chihuo','2',5,'成都太巴适了！火锅串串吃不完，生活节奏慢，房价也不贵。唯一的缺点可能就是冬天太阴冷了，见不到太阳。',true,'2024-03-10'],
      ['4','4','海的女儿','https://api.dicebear.com/7.x/avataaars/svg?seed=haide','3',5,'青岛的海太美了！夏天去海边游泳散步太舒服了。城市干净，人也热情，啤酒海鲜绝配！',true,'2024-01-25'],
      ['5','5','养老达人','https://api.dicebear.com/7.x/avataaars/svg?seed=yanglao','10',5,'昆明真的是春城！一年四季如春，冬天不冷夏天不热，鲜花常年盛开，特别适合养老。就是经济发展一般，年轻人机会可能少点。',true,'2024-02-05'],
      ['6','6','打工人','https://api.dicebear.com/7.x/avataaars/svg?seed=dagong','11',3,'上海机会确实多，薪资也高。但压力太大了，房价高得离谱，生活节奏快到喘不过气。适合年轻人打拼，但不适合定居。',true,'2024-03-01'],
      ['7','7','快乐打工人','https://api.dicebear.com/7.x/avataaars/svg?seed=kuaile','13',5,'长沙真的幸福感爆棚！房价低，美食多，娱乐丰富。周末可以去橘子洲头散步，晚上吃小龙虾喝奶茶，太爽了！',true,'2024-03-15'],
      ['8','8','旅行者','https://api.dicebear.com/7.x/avataaars/svg?seed=lvxing','4',4,'厦门风景真的没话说，鼓浪屿、环岛路都很美。但房价太高了，工资又一般，性价比不是很高。旅游可以，定居的话要考虑考虑。',true,'2024-02-28'],
    ];
    for (const r of reviews) {
      await connection.query(
        `INSERT INTO reviews (id, user_id, username, user_avatar, city_id, rating, content, is_approved, created_at) VALUES (?,?,?,?,?,?,?,?,?)`,
        r
      );
    }
    console.log(`  ✅ 已导入 ${reviews.length} 条评价数据`);
  } else {
    console.log('  ⏭️  评价数据已存在，跳过');
  }

  // 导入公告数据
  const [annRows] = await connection.query('SELECT COUNT(*) as count FROM announcements');
  if ((annRows as any)[0].count === 0) {
    const announcements = [
      ['1','欢迎来到如意城市','感谢您使用如意城市平台！我们致力于为您提供最科学、最贴心的宜居城市推荐服务。如有任何问题，欢迎联系客服。',true,'2024-01-01'],
      ['2','新增20个城市数据','平台已新增20个三四线城市的宜居数据，涵盖更多选择，快来看看有没有您心仪的城市吧！',true,'2024-02-15'],
    ];
    for (const a of announcements) {
      await connection.query(
        `INSERT INTO announcements (id, title, content, is_active, created_at) VALUES (?,?,?,?,?)`,
        a
      );
    }
    console.log(`  ✅ 已导入 ${announcements.length} 条公告数据`);
  } else {
    console.log('  ⏭️  公告数据已存在，跳过');
  }

  // 导入管理员数据
  const [adminRows] = await connection.query('SELECT COUNT(*) as count FROM admins');
  if ((adminRows as any)[0].count === 0) {
    await connection.query(
      `INSERT INTO admins (id, username, password) VALUES (?,?,?)`,
      ['admin1','admin','admin123']
    );
    console.log('  ✅ 已导入管理员数据 (admin / admin123)');
  } else {
    console.log('  ⏭️  管理员数据已存在，跳过');
  }

  // 导入社区笔记数据
  const [noteRows] = await connection.query('SELECT COUNT(*) as count FROM notes');
  if ((noteRows as any)[0].count === 0) {
    const notes = [
      ['1001','1','如意用户','https://api.dicebear.com/7.x/avataaars/svg?seed=ruyi','1','杭州','西湖边的周末','周末和朋友去了西湖，秋日的西湖真的太美了！金黄的银杏叶配上湖光山色，随手一拍都是大片。分享几个小众拍照点：1. 花港观鱼附近的红枫；2. 曲院风荷的水杉林；3. 杨公堤的日落。','["https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=800&q=80","https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80"]',28,6,156,true,'2024-03-12 14:30:00','2024-03-12 14:30:00'],
      ['1002','2','杭州小资','https://api.dicebear.com/7.x/avataaars/svg?seed=hangzhou','1','杭州','杭州适合周末逛的咖啡馆清单','整理了几家杭州周末值得一去的咖啡馆：1. 皮市巷的小众手冲，环境安静适合看书；2. 河坊街附近的民国风咖啡馆，拍照很好看；3. 灵隐寺附近的山景咖啡馆，可以看山景。都各有特色，推荐！','["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80"]',42,15,320,true,'2024-03-08 10:15:00','2024-03-08 10:15:00'],
      ['1003','3','吃货一枚','https://api.dicebear.com/7.x/avataaars/svg?seed=chihuo','2','成都','成都本地人推荐的火锅店！','来成都玩别再去网红火锅店了！本地人常去的几家：1. 蜀大侠（春熙路店）；2. 大龙燚（玉林店）；3. 小龙坎（总店）。一定要点毛肚、黄喉、鸭肠，搭配香油蒜泥绝了！人均100出头，性价比超高。','["https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80","https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80","https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800&q=80"]',108,32,890,true,'2024-03-05 19:40:00','2024-03-05 19:40:00'],
      ['1004','4','慢生活','https://api.dicebear.com/7.x/avataaars/svg?seed=slowlife','2','成都','住在成都三年的感受','从深圳搬到成都三年了，说说真实感受：房价确实友好，买了套三环内的首付才30万；美食真的吃不完，周末换着来；缺点是冬天太阴冷，偶尔一个月见不到太阳。总体很满意，幸福感比深圳高太多！','["https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=800&q=80"]',76,25,620,true,'2024-02-28 21:00:00','2024-02-28 21:00:00'],
      ['1005','5','海边的风','https://api.dicebear.com/7.x/avataaars/svg?seed=seaside','3','青岛','青岛夏天去哪玩？本地人攻略','青岛夏天正确打开方式：1. 早上去栈桥喂海鸥，逛到八大关；2. 中午去啤酒城附近吃海鲜大排档；3. 下午金沙滩游泳，沙子很软；4. 晚上台东步行街吃小吃。啤酒一定要喝袋装原浆！','["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80","https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80"]',59,18,480,true,'2024-03-10 11:20:00','2024-03-10 11:20:00'],
      ['1006','6','老青岛','https://api.dicebear.com/7.x/avataaars/svg?seed=laoqingdao','3','青岛','青岛住哪里方便？分区介绍','给来青岛旅游的朋友整理一下住宿建议：1. 市南区：靠近栈桥、八大关，方便但稍贵；2. 崂山区：海景房多，适合度假；3. 黄岛区：金沙滩附近，性价比高。我一般推荐市南区，去哪都近。','["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80"]',33,9,260,true,'2024-03-01 16:00:00','2024-03-01 16:00:00'],
      ['1007','7','海岛控','https://api.dicebear.com/7.x/avataaars/svg?seed=island','16','三亚','三亚避坑指南（血泪经验）','刚从三亚回来，分享避坑：1. 不要在景区门口买海鲜，去第一市场买了加工；2. 天涯海角就两块石头，时间紧可以不去；3. 蜈支洲岛确实美，但水上项目有点贵；4. 椰梦长廊日落一定要看，免费！5. 租车要选大平台。','["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80","https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80","https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&q=80"]',95,28,750,true,'2024-02-20 15:30:00','2024-02-20 15:30:00'],
      ['1008','8','快乐打工人','https://api.dicebear.com/7.x/avataaars/svg?seed=kuaile','13','长沙','长沙周末2天怎么玩？','周末去长沙的攻略来了！Day1：上午橘子洲头，中午太平老街吃小吃（臭豆腐、糖油粑粑），下午岳麓山+岳麓书院，晚上黄兴路步行街+茶颜悦色；Day2：上午湖南省博物馆（一定要预约！），下午逛潮宗街，晚上文和友拍照。茶颜悦色一天3杯起步！','["https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80"]',121,42,1050,true,'2024-03-15 09:00:00','2024-03-15 09:00:00'],
      ['1009','9','春城老人','https://api.dicebear.com/7.x/avataaars/svg?seed=chuncheng','10','昆明','来昆明养老三年了，谈谈真实感受','退休后和老伴来昆明定居，说下真实感受：气候真的无敌，冬天不用暖气夏天不用空调；物价不高，菜市场很丰富；医疗资源稍微弱一点，但三甲医院也够用；紫外线强是真的，出门一定要戴帽子防晒。总体很推荐！','["https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80"]',67,21,540,true,'2024-02-10 14:00:00','2024-02-10 14:00:00'],
      ['1010','10','南京学长','https://api.dicebear.com/7.x/avataaars/svg?seed=nanjiang','8','南京','南京高校周边租房攻略','在南京读了7年书，给学弟学妹整理一下高校周边租房：1. 仙林大学城（南大、南师）：亚东城、南大和园，性价比最高；2. 浦口大学城（南信大、南工）：房价最低，但离市区远；3. 江宁大学城（东大、南航）：地铁方便，配套成熟。合租1500左右能租到不错的。','["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"]',44,12,350,true,'2024-03-03 20:00:00','2024-03-03 20:00:00'],
      ['1011','11','打工人日记','https://api.dicebear.com/7.x/avataaars/svg?seed=worker','12','深圳','在深圳工作5年，要不要离开？','在深圳某大厂5年了，说说纠结：好处是薪资高、涨薪快、机会多；坏处是房价太夸张了，买房无望，生活节奏快到喘不过气。最近打算攒够首付去成都或者杭州定居了。有同款纠结的朋友吗？','["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"]',188,86,2300,true,'2024-03-18 22:30:00','2024-03-18 22:30:00'],
      ['1012','12','西安土著','https://api.dicebear.com/7.x/avataaars/svg?seed=xian','7','西安','西安美食地图！本地人亲测','西安本地人整理的美食，别只去回民街了：1. 洒金桥才是本地人的美食天堂，老金家蛋菜夹馍必吃；2. 大车家巷的裤带面；3. 小南门早市，体验本地生活；4. 醉长安、长安大牌档适合游客，味道不会踩雷。肉夹馍要腊汁肉的！','["https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80","https://images.unsplash.com/photo-1541529086526-db283c563270?w=800&q=80"]',82,30,680,true,'2024-03-20 12:00:00','2024-03-20 12:00:00'],
    ];

    for (const n of notes) {
      await connection.query(
        `INSERT INTO notes (id, user_id, username, user_avatar, city_id, city_name, title, content, images, like_count, comment_count, view_count, is_approved, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        n
      );
    }
    console.log(`  ✅ 已导入 ${notes.length} 条社区笔记数据`);
  } else {
    console.log(`  ⏭️  社区笔记数据已存在，跳过 (${(noteRows as any)[0].count} 条)`);
  }

  await connection.end();
  console.log('\n🎉 数据库初始化完成！');
  console.log(`\n📋 数据库信息：`);
  console.log(`   主机: ${DB_HOST}:${DB_PORT}`);
  console.log(`   数据库名: ${DB_NAME}`);
  console.log(`   用户名: ${DB_USER}`);
  console.log(`\n🔑 管理员账号: admin / admin123`);
  process.exit(0);
}

initDatabase().catch(err => {
  console.error('❌ 初始化失败:', err);
  process.exit(1);
});
