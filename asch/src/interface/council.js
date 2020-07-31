

module.exports = (router) => {
  router.get('/info', async (req) => {

    const councilInfo = modules.council.getCouncilInfo()
    return { councilInfo }
  })

  router.get('/members', async (req) => {
    let members = app.sdb.getAll('CouncilMember') || []
    members = members.sort((a, b) => b.votes - a.votes)
    return {
      count: members.length,
      members,
    }
  })

  router.get('/payments', async (req) => {
    const offset = req.query.offset ? Number(req.query.offset) : 0
    const limit = req.query.limit ? Number(req.query.limit) : 20
    const sort = {}
    if (req.query.orderBy) {
      const orderBy = req.query.orderBy.split(':')
      sort[orderBy[0]] = orderBy[1] === 'desc' ? -1 : 1
    }
    let payments = []
    const condition = {}
    if (Number(req.query.pending) === 1) {
      condition.pending = Number(req.query.pending)
    }
    const count = await app.sdb.count('CouncilTransaction', condition)
    if (count > 0) {
      payments = await app.sdb.findAll('CouncilTransaction', {
        condition, offset, limit, sort,
      })
    }
    return { count, payments }
  })

  router.get('/pendingPayment/:tid', async (req) => {
    const payment = await app.sdb.findOne('CouncilTransaction', { condition: { id: req.params.id } })
    if (!payment) throw new Error('Payment no found')
    return { payment }
  })

  // 测试 get
  router.get('/getcouncil', async (req) => {
    //const count = app.sdb.count('CouncilMember')
    let members = await app.sdb.findAll('CouncilMember', { condition: { status: 1 } }) || [];
    return members
  })

  // 获取投票列表
  router.get('/getVotes', async (req) => {
    let votelist = []

    // 增加，删除成员投票
    let Council = await app.sdb.findAll('CouncilVote', { condition: { sign: 1 } }) || [];
    if (Council) {
      for (let i = 0; i < Council.length; i++) {
        const type = "增加成员";
        if (Council[i].type == 1) type = "删除成员";
        var count = Council[i].voter.split(',');
        votelist.push({
          name: Council[i].targets,
          type: type,
          votes: count.length,
          amount: 0
        })
      }
    }

    let trans = await app.sdb.findAll('CouncilTransaction', { condition: { pending: 1 } }) || [];
    if (trans) {
      for (let j = 0; j < trans.length; j++) {
        const type = "转账";
        votelist.push({
          name: trans[i].tid,
          type: type,
          votes: trans[i].sign,
          amount: trans[i].amount
        })
      }
    }
    return votelist
  })


}
