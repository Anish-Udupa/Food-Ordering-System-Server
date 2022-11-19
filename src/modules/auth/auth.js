const db = require("../../db/db");


const login = async (data) => {
    let conn;
    let status = false, uid=null, name = null;
    try {
      conn = await db.pool.getConnection();
      const q_data = (await conn.query(`SELECT Uid as uid, Password as password FROM user_login WHERE Email="${data.email}";`))[0];
      // console.log(q_data);
      if(q_data != undefined && q_data.password === data.password){
        const uname = (await conn.query(`SELECT FName as name from user WHERE Uid="${q_data.uid}";`))[0];
        if(uname != undefined){
          status = true;
          uid = q_data.uid;
          name = uname.name;
        }
      }
    }
    catch(err){
      console.log(err);
    }
    finally {
      if(conn) conn.close();
    }
    return {
      status: status,
      uid: uid,
      name: name,
    };
}

const signup = async (data) => {
    let status = false, uid = null, name = null;
    let conn;
    try{
      conn = await db.pool.getConnection();
      const rec_count = Number((await conn.query("SELECT count(*) AS count from user;"))[0].count);
      // TODO: Check if same email is registered. If yes, reject signup attempt
      // console.log(rec_count);
      await conn.query(`INSERT INTO user (Uid, Fname, LName, HouseNo, Street, Area, City, Email, Phone) VALUES (${rec_count+1}, "${data.fname}", "${data.lname}", "${data.house_no}", "${data.street}", "${data.area}", "${data.city}", "${data.email}", ${data.phone})`);
      await conn.query(`INSERT INTO user_login VALUES (${rec_count+1}, "${data.email}", "${data.password}")`);
      status = true;
      uid = rec_count+1;
      name = data.fname;
    }
    catch(err){
      console.log(err);
    }
    finally {
      if(conn) conn.end();
    }
    return {
      status: status,
      uid: uid,
      name: name,
    };
}

module.exports = { login, signup };