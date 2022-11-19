const db = require("../../db/db");

const placeOrder = async (data) => {
    // Structure of data:
    // data = {
    //  uid: ---,
    //  total_cost: ---,
    //  items: [{id: ---, name: ---, quantity: ---, price: ---}, ---], 
    // }
    
    let conn, ret = {
      status: false,
      bill_no: null,
      order_data: data,
    };
    try{
      conn = await db.pool.getConnection();
      const bill_no = Number((await conn.query(`SELECT count(*) as bill_no from bill;`))[0].bill_no) + 1;
      // console.log("Bill NO: " + bill_no);
      await conn.query(`INSERT INTO bill VALUES (${bill_no}, ${data.uid}, ${data.total_cost}, NULL)`)  // Error. Check here
      data.items.map(async (item) => {
        // console.log(item);
        await conn.query(`INSERT INTO bill_item (Bill_No, Item_Id, Quantity, Price) VALUES (${bill_no}, ${item.id}, ${item.quantity}, ${item.price});`);
        console.log("Done");
      })
      ret.status = true;
      ret.bill_no = bill_no;
    }
    catch(err){
      console.log(err);
    }
    finally{
      if(conn) conn.close();
    }
    return ret;
}

module.exports = { placeOrder };