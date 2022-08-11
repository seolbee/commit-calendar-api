import Token from './model/auth/token';

const koa = require('koa');
const koaRouter = require('koa-router');
const views = require('koa-views');
const path = require('path');
const nunjucks = require('nunjucks');
const request = require('request');

require('dotenv').config();

const app = new koa();
const router = new koaRouter();

const git_token = new Token();
const notion_token = new Token();

app.use(views(path.join(__dirname, 'views'), { map : { html : 'nunjucks' }}));
nunjucks.configure('views', {
    koa:app
});

router.get('/', async ctx => {
    await ctx.render('index', {
        git_clientId : process.env.GITHUB_CLIENTID,
        git_user: process.env.GITHUB_USER,
        git_email: process.env.GITHUB_EMAIL,
        notion_clientId:process.env.NOTION_CLIENTID,
        notion_user:process.env.NOTION_USER,
        notion_redirect:'http://localhost:8090/callback?type=notion'
    });
});

router.get('/callback', ctx => {
    let {type, code} = ctx.query;
    
    if(type == 'github'){
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
                        redirect_uri:'http://localhost:8090/callback?type=github'
                    }
                }, 
                function(err, response, body){
                    if(err){
                        console.error(err);
                        reject(err);
                    }
    
                    if(response.statusCode == 200){
                        body = JSON.parse(body);
                        git_token.setToken(body);
                        ctx.redirect('/dashboard');
                        resolve(true);
                    }
                }
            );
        });
    } else {
        return new Promise((resolve, reject) => {
            request(
                {
                    url: 'https://api.notion.com/v1/oauth/token',
                    method:'post',
                    headers:{
                        Accept:'application/json',
                        'user-agent': 'node.js',
                        Authorization:`Basic ${process.env.NOTION_CLIENTID}${process.env.NOTION_CLIENTSECRET}`
                    },
                    form : {
                        grant_type:'authorization_code',
                        code : code,
                        redirect_uri:'http://localhost:8090/callback?type=notion'
                    }
                }, 
                function(err, response, body){
                    if(err){
                        console.error(err);
                        reject(err);
                    }
    
                    if(response.statusCode == 200){
                        body = JSON.parse(body);
                        notion_token.setToken(body);
                        ctx.redirect('/dashboard');
                        resolve(true);
                    }
                }
            );
        });
    }
});

router.get('/dashboard', async ctx => {

    // return new Promise((resolve, reject) => {
    //     request(
    //         {
    //             url: 'https://api.github.com/repos/seolbee/commit-calendar-api/commits',
    //             method:'GET',
    //             headers:{
    //                 Accept:'application/json',
    //                 Authorization: git_token.token,
    //                 'user-agent': 'node.js'
    //             }
    //         },
    //         function(err, response, body){
    //             if(err){
    //                 console.error(err);
    //                 reject(ctx.render('error', {'error' : err}));
    //             }

    //             if(response.statusCode == 200){
    //                 resolve(ctx.render('dashboard', {'commit_list':body}));
    //             }
    //         }
    //     );
    // });
    await ctx.render('dashboard');
})

app.use(router.routes());

app.listen('8090', ()=> {
    console.log('서버 실행 중');
});