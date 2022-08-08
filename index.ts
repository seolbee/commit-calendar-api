const koa = require('koa');
const koaRouter = require('koa-router');
const views = require('koa-views');
const path = require('path');
const nunjucks = require('nunjucks');

require('dotenv').config();

const app = new koa();
const router = new koaRouter();

app.use(views(path.join(__dirname, 'views'), { extends: nunjucks }));
nunjucks.configure('views', {
    koa:app
});

router.get('/', async (ctx) => {
    await ctx.render('index', {
        clientId : process.env.GITHUB_CLIENTID,
        user: process.env.GITHUB_USER,
        email: process.env.GITHUB_EMAIL
    });
});

app.use(router.routes());

app.listen('8090', ()=> {
    console.log('서버 실행 중');
});