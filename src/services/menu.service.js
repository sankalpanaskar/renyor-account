// services/menu.service.js
const db = require('../config/db');

exports.fetchMenu = async (packageId) => {
  const [rows] = await db.query(
    `
    SELECT DISTINCT
      m.id,
      m.menu_name,
      m.parent_id,
      m.menu_pic,
      m.link
    FROM package_modules p
    JOIN menu_modules m
      ON m.id = p.menu_id
       OR m.id = p.parent_menu_id
    WHERE p.package_id = ?
      AND p.status = 1
      AND m.status = 1
    ORDER BY m.parent_id, m.id
    `,
    [packageId]
  );

  const map = {};
  const menu = [];

  // create map
  rows.forEach(row => {
    map[row.id] = {
      id: row.id,
      title: row.menu_name,
      parent_id: row.parent_id,
      icon: row.menu_pic,
      link: row.link,
      children: []
    };
  });

  // build tree
  rows.forEach(row => {
    if (row.parent_id === 0) {
      menu.push(map[row.id]);
    } else if (map[row.parent_id]) {
      map[row.parent_id].children.push(map[row.id]);
    }
  });

  return menu;
};


