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

router.get('/callback', (ctx, next) => {
    let {code} = ctx.query;
    
    return new Promise((resolve, reject) => {
        request(
            {
                url: 'https://github.com/login/oauth/access_token',
                method:'post',
                headers:{
                    Accept:'application/json',
                    'user-agent': 'node.js'
                },
                form : {
                    client_id:process.env.GITHUB_CLIENTID,
                    client_secret:process.env.GITHUB_CLIENTSECRET,
                    code : code,
                    redirect_uri:'http://localhost:8090/callback'
                }
            }, function(err, response, body){
                if(err){
                    console.error(err);
                    reject(err);
                }

                if(response.statusCode == 200){
                    body = JSON.parse(body);
                    token_obj.token = body.access_token;
                    token_obj.type = body.type;
                    ctx.redirect('/dashboard');
                    resolve(true);
                }
            }
        );
    })
});

router.get('/dashboard', ctx => {

    return new Promise((resolve, reject) => {
        request(
            {
                url: 'https://api.github.com/repos/seolbee/commit-calendar-api/commits',
                method:'GET',
                headers:{
                    Accept:'application/json',
                    Authorization: `${token_obj.type} ${token_obj.token}`,
                    'user-agent': 'node.js'
                }
            },
            function(err, response, body){
                if(err){
                    console.error(err);
                    reject(ctx.render('error', {'error' : err}));
                }

                if(response.statusCode == 200){
                    resolve(ctx.render('dashboard', {'commit_list':body}));
                }
            }
        );
    });
})

app.use(router.routes());

app.listen('8090', ()=> {
    console.log('서버 실행 중');
});