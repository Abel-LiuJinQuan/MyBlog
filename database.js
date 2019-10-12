/*数据库配置文件*/
const mysql = require('mysql')
const config = require('./config')
// 连接数据库
// const database = mysql.createConnection({
// 	host:config.host,
// 	user:config.user,
// 	port:config.port,
// 	password:config.password,
// 	database:config.database
// });

var connString = 'mysql://root:C1998082904CBA..@localhost/blog?charset=utf8_general_ci&timezone=-0700';
 
var conn = mysql.createConnection(connString);

conn.connect(function(err) {
	if(err) throw err;
	console.log("connected!");
});

module.exports = conn;