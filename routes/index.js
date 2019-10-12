var express = require('express');
var router = express.Router();
//引入md5加密
var crypto = require('crypto');
var mysql = require('./../database')

/* 首页,分页显示博客列表*/
router.get('/', function(req, res, next) {
	var page = req.query.page || 1;
	console.log(page);
	var start = (page - 1) * 8;
	var end = page * 8;
	var queryCount = 'select count(*) as articleNum from article';
	var queryArticle = 'select * from article order by articleID desc limit ' 
	+ start + ',' + end;
	mysql.query(queryArticle,function(err,rows,fields) {
		var articles = rows;
		articles.forEach(function(ele) {
			var year = ele.articleTime.getFullYear();
			var month = ele.articleTime.getMonth(); +1 > 10 ?ele.articleTime.getMonth() : 
			'0' + (ele.articleTime.getMonth() + 1);
			var date = ele.articleTime.getDate() > 10 ? ele.articleTime.getDate() : '0' 
			+ ele.articleTime.getDate();
			month++;
			ele.articleTime = year + '-' + month + '-' + date;
		});
		mysql.query(queryCount,function(err,rows,fields) {
			var articleNum = rows[0].articleNum;
			var pageNum = Math.ceil(articleNum / 8);
			res.render("index", { 
				articles: articles ,
				user: req.session.user,
				pageNum:pageNum,
				page:page
			});
		})
		
	});
});

router.get('/login',function(req,res,next) {
	res.render('login',{message:''});
});

router.post('/login',function(req,res,next) {
	var name = req.body.name;
	var password = req.body.password;
	var hash = crypto.createHash('md5');
	hash.update(password);
	password= hash.digest('hex');
	var query = 'select * from author where authorName = ' + mysql.escape(name) 
	+ ' and authorPassword = ' + mysql.escape(password);
	mysql.query(query,function(err,rows,fields) {
		if(err) {
			console.log(err);
			return;
		}
		var user = rows[0];
		if (!user) {
			res.render('login',{message:'用户名或密码错误!'});
			return;
		}
		//将user信息存在session中
		req.session.user = user;
		res.redirect('/');
	});

});

/*文章内容详情页*/
router.get('/articles/:articleID', function(req,res,next) {
	//获取请求url中的参数
	var articleID = req.params.articleID;
	var query = 'select * from article where articleID = ' + mysql.escape(articleID);
	var user = req.session.user;
	mysql.query(query,function(err,rows,fields) {
		if (err) {
			console.log(err);
			return;
		}
		//点击量 + 1
		var query = 'update article set articleClick = articleClick + 1 where articleID = '
		+ mysql.escape(articleID);
		mysql.query(query,function(err,rows,fields) {
			if (err) {
				console.log(err);
				return;
			}
		});
		// console.log(rows);
		var article = rows[0];
		//详情页显示的点击量+1
		article.articleClick ++;
		// console.log(articles);
		var year = article.articleTime.getFullYear();
		var month = article.articleTime.getMonth(); +1 > 10 ?article.articleTime.getMonth() : 
		'0' + (article.articleTime.getMonth() + 1);
		var date = article.articleTime.getDate() > 10 ? article.articleTime.getDate() : '0' 
		+ article.articleTime.getDate();
		article.articleTime = year + '-' + month + '-' + date;
		res.render("article", { article: article,user:user });	
	});
		
});

/*撰写博客请求*/
router.get('/edit',function(req,res,next) {
	var user = req.session.user;
	//未登录时，跳转至登录页面
	if (!user) {
		res.redirect('/login');
		return;
	}
	res.render('edit',{user:user});
});

/*发布博客文章*/
router.post('/edit',function(req,res,next) {
	var title = req.body.title;
	var content = req.body.content;
	var author = req.session.user.authorName;
	var user = req.session.user;
	var query = 'insert article set articleTitle = ' + mysql.escape(title) 
	+ ',articleAuthor = ' + mysql.escape(author) + ',articleContent = ' 
	+ mysql.escape(content) + ',articleTime = CURDATE()';
	mysql.query(query,function(err,rows,fields) {
		if (err) {
			console.log(err);
			return;
		}
		// res.redirect('/',{user:user});
		res.redirect('/');
	});
});

//友情链接
router.get('/friends',function(req,res,next) {
	res.render('friends',{user:req.session.user});
});
//关于博客
router.get('/about',function(req,res,next) {

	res.render('about',{user:req.session.user});
});
//登出博客
router.get('/logout',function(req,res,next) {
	req.session.user = null;
	res.redirect('/');
});

//进入修改文章功能
router.get('/modify/:articleID',function(req,res,next) {
	var articleID = req.params.articleID;
	var user = req.session.user;
	var query = 'select * from article where articleID = ' + mysql.escape(articleID);
	if (!user) {
		res.redirect('/login');
		return;
	}
	mysql.query(query,function(err, rows, fields) {
		if (err) {
			console.log(err);
			return;
		}
		var article = rows[0];
		var title = article.articleTitle;
		var content = article.articleContent;
		console.log(title,content);
		res.render('modify',{user:user,article:article,title:title,content:content});
	});
});
//保存修改后的文章
router.post('/modify/:articleID', function(req,res,next) {
	var articleID = req.params.articleID;
	var user = req.session.user;
	var title = req.body.title;
	var content = req.body.content;
	var query = 'update article set articleTitle = ' + mysql.escape(title) 
	+ ',articleContent = ' + mysql.escape(content) + 'where articleID = ' 
	+ mysql.escape(articleID);
	mysql.query(query,function(err,rows,fields) {
		 if (err) {
		 	console.log(err);
		 	return;
		 }
		 res.redirect('/');
	});
});
//删除文章接口
router.get('/delete/:articleID',function(req,res,next) {
	var articleID = req.params.articleID;
	var user = req.session.user;
	var query = 'delete from article where articleID = ' + mysql.escape(articleID);
	if (!user) {
		res.redirect('/login');
		return;
	}
	mysql.query(query,function(err,rows,fields) {
		res.redirect('/');
	});
});

module.exports = router;
