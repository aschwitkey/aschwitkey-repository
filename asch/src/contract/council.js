//判断是否是理事会成员
function isCouncilMember(address) {
  let members = app.sdb.getAll('CouncilMember') || []
  members = members = members.sort((a, b) => b.votes - a.votes).slice(0, 3)
  return members.find(i => i.address === address)
}


module.exports = {

  //注册理事会成员 type=0 sign=1未生效
  // async register(website) {

  //   const regist = await app.sdb.getAll('CouncilVote', { type: 0, sign: 1 })
  //   if (regist) return "Still people who have not passed"

  //   if (!website || typeof website !== 'string' || website.length > 256) return 'Invalid parameters'
  //   const senderId = this.sender.address
  //   const sender = this.sender
  //   if (!sender) return 'Account not found'
  //   if (!sender.name) return 'Account has not a name'
  //   if (sender.role) return 'Account already have a role'

  //   app.sdb.create('CouncilMember', {
  //     address: senderId,
  //     name: sender.name,
  //     tid: this.trs.id,
  //     publicKey: this.trs.senderPublicKey,
  //     votes: 1,
  //     website,
  //   })
  //   sender.role = app.AccountRole.COUNCIL_MEMBER//=4
  //   app.sdb.update('Account', { role: app.AccountRole.COUNCIL_MEMBER }, { address: senderId })

  //   return null
  // },


  async register(name, address, website) {

    const regist = await app.sdb.getAll('CouncilVote', { type: 0, sign: 1 })
    if (regist) return "Still people who have not passed"

    if (!website || typeof website !== 'string' || website.length > 256) return 'Invalid parameters'

    if (!address) return 'Account not found'
    if (!name) return 'Account has not a name'

    app.sdb.create('CouncilMember', {
      address: address,
      name: name,
      tid: this.trs.id,
      publicKey: this.trs.senderPublicKey,
      votes: 1,
      website,
    })
    sender.role = app.AccountRole.COUNCIL_MEMBER//=4
    app.sdb.update('Account', { role: app.AccountRole.COUNCIL_MEMBER }, { address: senderId })

    return null
  },

  // 移除成员 type=1
  async removeMember(targets) {
    const remove = await app.sdb.getAll('CouncilVote', { type: 1, sign: 1 })
    if (remove) return "Still people who have not passed"

    if (!app.util.address.isNormalAddress(address)) {
      return 'Invalid address'
    }
    const { session } = modules.council.getCouncilInfo()
    app.sdb.create('CouncilVote', {
      voter: this.sender.name,//投票人
      session: session,
      targets: targets,//移除人员
      type: 1,
      sign: 1//未生效
    })

    return null
  },

  //以前的投票  是否广播 最多投三人
  async oldvote(targets) {
    if (!targets || typeof targets !== 'string') return 'Invalid parameters'
    const names = targets.split(',')
    //if (names.length > 3) return 'Up to 3 targets'

    const memberNames = new Set()
    for (const member of app.sdb.getAll('CouncilMember')) {
      memberNames.add(member.name)
    }
    for (const name of names) {
      if (!memberNames.has(name)) return 'Target is not council member'
    }

    if (!app.isCurrentBookkeeper(this.sender.address)) return 'Permission denied'

    const { session, status } = modules.council.getCouncilInfo()//在node_modules\asch-core\src\core\council.js文件中
    if (status === 1) return 'Invalid session status'

    const voter = this.sender.name
    const exists = await app.sdb.exists('CouncilVote', { voter, session })//查看这个人是不是投过票
    if (exists) return 'Already voted'

    app.sdb.create('CouncilVote', { voter, session, targets })
    for (const name of names) {
      app.sdb.increase('CouncilMember', { votes: 1 }, { name })//增量为1，每次+1
    }
  },

  //增加用户的投票 ---修改council_votes表中voter字段长度为250
  async vote(targets) {

    if (!isCouncilMember(this.sender.address)) return 'Permission denied'

    if (!targets || typeof targets !== 'string') return 'Invalid parameters'
    //const names = targets.split(',')
    //if (names.length > 3) return 'Up to 3 targets'

    const memberNames = new Set()
    for (const member of app.sdb.getAll('CouncilMember')) {
      memberNames.add(member.name)
    }
    for (const name of names) {
      if (!memberNames.has(name)) return 'Target is not council member'
    }

    if (!app.isCurrentBookkeeper(this.sender.address)) return 'Permission denied'

    const { session, status } = modules.council.getCouncilInfo()//在node_modules\asch-core\src\core\council.js文件中
    if (status === 1) return 'Invalid session status'

    const voter = this.sender.name

    // const exists = await app.sdb.exists('CouncilVote', { voter, session })//查看这个人是不是投过票
    // if (exists) return 'Already voted'
    const count = await app.sdb.count('CouncilMember');

    //注册用户
    const votement = await app.sdb.load('CouncilVote', { targets: targets, type: 0, sign: 1 })
    if (!votement) {//不存在
      app.sdb.create('CouncilVote', {
        voter: voter,//投票人
        session: session,
        targets: targets,//注册的人
        type: 0,//类型为注册
        sign: 1//未生效
      })
    }
    else {//记录已存在
      let voters = votement.voter.split(',');//查看这个人是不是投过票
      if (voters.indexOf(voter) > -1) return 'Already voted'
      if ((voters.length / (count - 1)) > 2 / 3) {//投票超过2/3 开始生效
        app.sdb.increase('CouncilVote', { sign: 0 })
        app.sdb.increase('CouncilMember', { voter: 999 }, { name })
      }

      app.sdb.increase('CouncilVote', { voter: `,${voter}` })
    }
    for (const name of names) {
      app.sdb.increase('CouncilMember', { votes: 1 }, { name })//增量为1，每次+1
    }

  },


  //删除用户时的投票
  async deleteVote(targets) {
    if (!isCouncilMember(this.sender.address)) return 'Permission denied'

    if (!targets || typeof targets !== 'string') return 'Invalid parameters'

    const { session, status } = modules.council.getCouncilInfo()//在node_modules\asch-core\src\core\council.js文件中
    if (status === 1) return 'Invalid session status'

    const voter = this.sender.name

    // const exists = await app.sdb.exists('CouncilVote', { voter, session })//查看这个人是不是投过票
    // if (exists) return 'Already voted'
    const count = await app.sdb.count('CouncilMember');

    //注册用户
    const votement = await app.sdb.load('CouncilVote', { targets: targets, type: 1, sign: 1 })
    if (!votement) {//不存在
      app.sdb.create('CouncilVote', {
        voter: voter,//投票人
        session: session,
        targets: targets,//注册的人
        type: 1,//类型为删除
        sign: 1//未生效
      })
    }
    else {//记录已存在
      let voters = votement.voter.split(',');//查看这个人是不是投过票
      if (voters.indexOf(voter) > -1) return 'Already voted'
      if ((voters.length / (count - 1)) > 2 / 3) {//投票超过2/3 开始生效
        app.sdb.increase('CouncilVote', { sign: 0 })
        app.sdb.increase('CouncilMember', { status: 0 })
      }

      app.sdb.increase('CouncilVote', { voter: `,${voter}` })
    }
  },

  // 理事会成员发起交易
  async initiatePayment(recipient, amount, currency, remarks) {
    // 有未完成的交易时，无法进行下一个交易
    const countTran = app.sdb.findOne('CouncilTransaction', { condition: { pending: 1 } })
    if (countTran) return 'There is a deal in progress'

    if (!app.util.address.isNormalAddress(recipient)) return 'Invalid recipient address'
    app.validate('amount', amount)
    if (currency !== 'XAS') return 'UIA token not supported'
    if (typeof remarks !== 'string' || remarks.length > 256) return 'Invalid remarks'
    if (typeof expiredAt !== 'number') return 'Invalid expired time'

    if (!isCouncilMember(this.sender.address)) return 'Permission denied'
    const session = modules.council.getCouncilInfo().session
    app.sdb.create('CouncilTransaction', {
      tid: this.trs.id,
      currency,
      amount,
      remarks,
      recipient,
      timestamp: this.trs.timestamp,
      //expirtedAt,
      pending: 1,//交易 不生效，=0 生效
      signs: 1,//签名
      session,
    })
  },

  //council_transaction表添加字段signId varchar（250）
  async signPayment(tid) {//签名交易

    if (!isCouncilMember(this.sender.address)) return 'Permission denied'

    const payment = await app.sdb.load('CouncilTransaction', tid)
    if (!payment) return 'Payment not found'

    if (payment.pending === 0) return 'Payment already finished'

    //todo 是否已投过票
    var address = this.sender.address;
    let comments = payment.signId.split(',');
    if (comments.indexOf(address) > -1) return 'Already voted'

    const height = modules.blocks.getLastBlock().height
    if (!!payment.expiredAt && height >= payment.expiredAt) return 'Payment expired'

    const session = modules.council.getCouncilInfo().session
    if (session !== payment.session) return 'Session expired'

    const amount = Number.parseInt(payment.amount)
    //查询理事会账号的余额
    const COUNCIL_ADDRESS = 'GADQ2bozmxjBfYHDQx3uwtpwXmdhafUdkN'
    const councilAccount = await app.sdb.load('Account', COUNCIL_ADDRESS)
    if (!councilAccount) return 'Council account not found'
    if (councilAccount.xas < amount) return 'Insufficient balance'

    //查询收款人
    const recipientAccount = await app.sdb.load('Account', payment.recipient)
    if (!recipientAccount) return 'Recipient account not found'

    payment.signs += 1
    app.sdb.increase('CouncilTransaction', { signs: 1, signId: `,${address}` }, { tid })//签名加1

    const count = await app.sdb.count('CouncilMember');

    if ((payment.signs / count) >= (2 / 3)) {//todo
      payment.pending = 0
      app.sdb.update('CouncilTransaction', { pending: 0 }, { tid })//这里超过了2/3 所以变为有效交易
      app.sdb.increase('Account', { xas: amount }, { address: payment.recipient })//收款地址+金额
      app.sdb.increase('Account', { xas: -1 * amount }, { address: COUNCIL_ADDRESS })//理事会账号-金额
      app.sdb.create('Transfer', {
        tid: this.trs.id,
        height: this.block.height,
        senderId: COUNCIL_ADDRESS,
        recipientId: recipientAccount.address,
        recipientName: recipientAccount.name,
        currency: payment.currency,
        amount: payment.amount,
        timestamp: this.trs.timestamp,
      })
      //加一条转账记录
    }
  }
}
