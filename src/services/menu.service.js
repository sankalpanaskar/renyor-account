// services/menu.service.js
const db = require('../config/db');

// exports.fetchMenu = async (packageId, roleId = null) => {
//   let rows;

//   // 🔵 CASE 1: Package-only (Company Super Admin)
//   if (!roleId) {
//     [rows] = await db.query(
//       `
//       SELECT DISTINCT
//         m.id,
//         m.menu_name,
//         m.parent_id,
//         m.menu_pic,
//         m.link
//       FROM package_modules p
//       INNER JOIN menu_modules m
//         ON m.id = p.menu_id
//       WHERE p.package_id = ?
//         AND p.status = 1
//         AND m.status = 1
//       ORDER BY m.parent_id, m.id
//       `,
//       [packageId]
//     );
//   }

//   // 🔵 CASE 2: Package + Role (Company User)
//   else {
//     const sql = `
//           SELECT DISTINCT
//             m.id,
//             m.menu_name,
//             m.parent_id,
//             m.menu_pic,
//             m.link
//           FROM package_modules p
//           INNER JOIN menu_modules m
//             ON m.id = p.menu_id
//           INNER JOIN role_menu_access rma
//             ON rma.menu_id = m.id
//           WHERE p.package_id = 20
//             AND p.status = 1
//             AND m.status = 1
//             AND rma.role_id = 6
//             AND rma.can_view = 1
//           ORDER BY m.parent_id, m.id
//         `;

//         const [rows] = await db.query(sql);
//         console.log(rows);
//   }

//   // 🌳 Build menu tree
//   const map = {};
//   const menu = [];

//   rows.forEach(row => {
//     map[row.id] = {
//       id: row.id,
//       title: row.menu_name,
//       parent_id: row.parent_id,
//       icon: row.menu_pic,
//       link: row.link,
//       children: []
//     };
//   });

//   rows.forEach(row => {
//     if (row.parent_id === 0) {
//       menu.push(map[row.id]);
//     } else if (map[row.parent_id]) {
//       map[row.parent_id].children.push(map[row.id]);
//     }
//   });

//   return menu;
// };

exports.fetchMenu = async (packageId,roleId = null) => {
  console.log(packageId,roleId)
  if(!roleId){
    console.log('dd');
    var [rows] = await db.query(
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
  } else{
    console.log('dsssd');

    var [rows] = await db.query(
      `
      SELECT DISTINCT
            m.id,
            m.menu_name,
            m.parent_id,
            m.menu_pic,
            m.link,
            COALESCE(rma.can_view, 0) AS can_view,
            COALESCE(rma.can_create, 0) AS can_create,
            COALESCE(rma.can_edit, 0) AS can_edit,
            COALESCE(rma.can_delete, 0) AS can_delete
        FROM package_modules p
        JOIN menu_modules m
            ON m.id = p.menu_id
            OR m.id = p.parent_menu_id
        LEFT JOIN role_menu_access rma
            ON rma.menu_id = m.id
            AND rma.role_id = ?
        WHERE p.package_id = ?
            AND p.status = 1
            AND m.status = 1
        ORDER BY m.parent_id, m.id
      `,
      [roleId, packageId]   // ✅ Correct order
    );


  } 

  console.log(rows)

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
    ...(row.parent_id !== 0 && { //using spread separetor
      can_view: row.can_view,
      can_create: row.can_create,
      can_edit: row.can_edit,
      can_delete: row.can_delete
    }),
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
  console.log(menu)

  return menu;
};




