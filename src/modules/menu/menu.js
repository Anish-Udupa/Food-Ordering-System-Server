const db = require("../../db/db");
const { foodObj } = require("../../helpers/menu_list");

// Inserts value of foodObj into menu table in db.
async function resetMenu() {
    // const foodObj = foodObj;
    const ret = {
        status: false,
    }
    let conn;

    try {
        conn = await db.pool.getConnection();
        Object.keys(foodObj).forEach((key) => {
            foodObj[key].map(async (item) => {
                await conn.query(`INSERT INTO MENU VALUES (${item.item_id}, "${item.title}", "${item.desc}", "${item.price}", "${key}", "${item.imgsrc}");`);
                // console.log(`Successfully inserted item id: ${item.item_id}`);
            })
        });
        ret.status = true;
    }
    catch(err) {
        console.log(err);
    }
    finally {
        if (conn) conn.close();
    }
    return ret;
}

const getMenu = async () => {
    let conn;
    const data = {};
    try {
      conn = await db.pool.getConnection();
    //   const data = await conn.query("Select * from Menu;");
        const categories_rows = await conn.query("SELECT DISTINCT Category from MENU");
      // console.log(data);

      for (let i=0; i<categories_rows.length; i++){
        let category = categories_rows[i].Category;
        data[category] = [];

        const category_items_rows = await conn.query(`SELECT * FROM MENU WHERE Category="${category}"`);
        for(let j=0; j<category_items_rows.length; j++){
            const item = category_items_rows[j];
            const obj = {
                item_id: item.Item_Id,
                title: item.Item_Name,
                desc: item.Item_Desc,
                imgsrc: item.Img_Src,
                imgalt: `Image of a ${item.Item_Name}`,
                price: item.Price,
            }
            data[category].push(obj);
        }
      }
      conn.end();
    }
    catch(err) {
      console.log(err);
    }
    finally {
      if(conn) conn.end();
    }
    return data;
  }

module.exports = { resetMenu, getMenu };