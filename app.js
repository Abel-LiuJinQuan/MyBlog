//引入项目模块
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

//设置视图文件夹的位置
app.set('views', path.join(__dirname, 'views'));
//设置项目中使用ejs模板引擎
app.set('view engine', 'ejs');
//使用日志记录中间件
app.use(logger('dev'));
//使用express中间件
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//使用cookieParser中间件
app.use(cookieParser());
//应用session配置
app.use(session({
	secret:'blog',
	cookie:{maxAge:1000*60*24*30},
	resave:false,
	saveUninitialized:true
}));

//使用路由index
app.use('/', indexRouter);
//使用路由users
app.use('/users', usersRouter);

//使用express默认的 static中间件设置静态资源文件夹的位置
app.use(express.static(path.join(__dirname, 'public')));

//处理404错误
app.use(function(req, res, next) {
  res.render('404');
});

//错误处理
app.use(function(err, req, res, next) {
  //设置本地错误信息仅在开发环境中提供
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  //渲染错误请求页面
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3000,function() {
	console.log('listening port 3000');
})

module.exports = app;
