module.exports = (router) => {
    // 获取账户列表
    router.get('/getListOne', async (req) => {
        const lists = await app.sdb.findAll('Account', {
            condition: {
                $or: [{
                        xas: {
                            $gt: 500000000000
                        }
                    },
                    {
                        weight: {
                            $gt: 500000000000
                        }
                    }
                ]
            }
        })

        return {
            lists
        }
    })
    // 获取账户列表从小到大排序
    router.get('/getAccountWeightAsc',async(req)=>{
        const offset = req.query.offset ? Number(req.query.offset) : 0
        const limit = req.query.limit ? Number(req.query.limit) : 20

        const sort = {
            weight:1
        }
        if (req.query.orderBy) {
            const orderBy = req.query.orderBy.split(':')
            sort[orderBy[0]] = orderBy[1] === 'desc' ? -1 : 1
        }
        const lists = await app.sdb.findAll('Account', {
            condition:{
                weight:{
                    $gt:0
                }
            },
            offset,
            limit,
            sort
        })
        return {
            lists
        }
    })
    // 获取持仓总数
    router.get('/getAccountWeight', async (req) => {
        const weight = await app.sdb.findAll('Account', {
            condition:{
                weight:{
                    $gt:0
                }
            }
        })
        return {
            lists: weight
        }
    })
    // 获取账户总数
    router.get('/getAccountNum', async (req) => {
       
        const count = await app.sdb.count('Account')
        return {
            count: count
        }
    })
    // 获取日活动数
    router.get('/dailyActivities', async (req) => {
        var date = new Date();
        var seperator1 = "-";
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate = year + seperator1 + month + seperator1 + strDate;
        var date = new Date(`${currentdate} 00:00:00`);
        var todayTime = Date.parse(date) / 1000 - 1467057600
        var yesterdayTime = (Date.parse(date) - 86400000) / 1000 - 1467057600;
        const count = await app.sdb.count('Transaction', {
            timestamp: {
                $gte: todayTime
            }
        })
        return {
            activateCount: count
        }
    })
    // 获取昨日活动数
    router.get('/dailyActivities/yester', async (req) => {
        var date = new Date();
        var seperator1 = "-";
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate = year + seperator1 + month + seperator1 + strDate;
        var date = new Date(`${currentdate} 00:00:00`);
        var todayTime = Date.parse(date) / 1000 - 1467057600
        var yesterdayTime = (Date.parse(date) - 86400000) / 1000 - 1467057600;
        const count = await app.sdb.count('Transaction', {
            timestamp: {
                $gte: yesterdayTime
            }
        })
        return {
            activateCount: count
        }
    })
}
