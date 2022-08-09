import { nextTick } from "process";

const koa = require('koa');
const koaRouter = require('koa-router');
const views = require('koa-views');
const path = require('path');
const nunjucks = require('nunjucks');
const request = require('request');

require('dotenv').config();

const app = new koa();
const router = new koaRouter();

const token_obj = {
    token:'',
    type:''
};

app.use(views(path.join(__dirname, 'views'), { map : { html : 'nunjucks' }}));
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

router.get('/callback', async (ctx, next) => {
    let {code} = ctx.query;
    
    await request({
        url: 'https://github.com/login/oauth/access_token',
        method:'post',
        headers:{
            Accept:'application/json'
        },
        form : {
            client_id:process.env.GITHUB_CLIENTID,
            client_secret:process.env.GITHUB_CLIENTSECRET,
            code : code,
            redirect_uri:'http://localhost:8090/callback'
        }
    }, async function(err, res, body){
        try {
            if(res.statusCode == 200){
                body = JSON.parse(body);
                token_obj.token = body.access_token;
                token_obj.type = body.token_type;
            }
        } catch (error) {
            console.error(err);
        }
    });

    await ctx.redirect('/dashboard');
});

router.get('/dashboard', async (ctx) => {
    await ctx.render('dashboard', {

    });
})

app.use(router.routes());

app.listen('8090', ()=> {
    console.log('서버 실행 중');
});