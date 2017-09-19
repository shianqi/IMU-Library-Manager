const express = require('express');
const router = express.Router();
const schedule = require("node-schedule")
const login = require('./service').login
const logout = require('./service').logout
const setResv = require('./service').setResv
const checkResv = require('./service').checkResv
const signInResv = require('./service').signInResv
const signOutResv = require('./service').signOutResv

const dateList = [
    {
        start: [7, 30],
        end: [11, 30]
    },
    {
        start: [11, 30],
        end: [15, 30]
    },
    {
        start: [15, 30],
        end: [19, 30]
    },
    {
        start: [19, 30],
        end: [22, 0]
    },
]

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

const reservation = async function(start, end){
    try {
        await login('0141122427', '0141122427')
        await setResv(100486650, 100482108, start, end)
        await logout()
    }catch(e){
        console.log("错误：", e)
    }
}

const priorReservation = async function(){
    try{
        const now = new Date()
        for(let i=0;i<dateList.length;i++){
            const start = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                dateList[i].start[0],
                dateList[i].start[1],
                0
            )
            const end = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                dateList[i].end[0],
                dateList[i].end[1],
                0
            )
            const startTomorrow = new Date(start.valueOf()+24*60*60*1000)
            const endTomorrow = new Date(end.valueOf()+24*60*60*1000)
            await reservation(start, end)
            await reservation(startTomorrow, endTomorrow)
        }
    } catch (e) {
        console.log(e)
    }
}

//100486652 3B1-091
//100486650 3B1-089
const signOut = async function() {
    try {
        await login('0141122427', '0141122427')
        const resvMessage = await checkResv()
        const { id='' } = resvMessage.length>0 ? resvMessage[0]:{}
        await signOutResv(id)
        await logout()
    }catch(e){
        console.log("签退错误：", e)
    }
}

const singIn = async function() {
    try {
        await login('0141122427', '0141122427')
        const resvMessage = await checkResv()
        const { devId, labId, id='' } = resvMessage.length>0 ? resvMessage[0]:{}
        await signInResv(devId, labId, id)
        await logout()
    }catch(e) {
        console.log("签到错误：", e)
    }
}


module.exports = router;
schedule.scheduleJob('20 7,11,15,19 * * *', async function(){
    await signOut()
    await singIn()
});
schedule.scheduleJob('* 10 7 * * *', async function(){
    await priorReservation()
});

