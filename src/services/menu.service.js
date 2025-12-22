// services/menu.service.js
const db = require('../config/db');

exports.fetchMenu = async (packageId) => {
  console.log(packageId);
  const [rows] = await db.query(
    `
    SELECT id, module_name, parent_id,menu_pic,link
    FROM package_modules
    WHERE package_id = ? AND status = 1
    ORDER BY parent_id, id
    `,
    [packageId]
  );

  const map = {};
  const menu = [];

  rows.forEach(row => {
    map[row.id] = {
      id: row.id,
      title: row.module_name,
      parent_id: row.parent_id,
      icon:row.menu_pic,
      link:row.link,
      children: []
    };
  });

  rows.forEach(row => {
    if (row.parent_id === 0) {
      menu.push(map[row.id]);
    } else if (map[row.parent_id]) {
      map[row.parent_id].children.push(map[row.id]);
    }
  });

  return menu;
};
