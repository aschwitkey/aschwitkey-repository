const { address } = require("ip")

//判断是否是理事会成员
function isCouncilMember(address) {
  let members = app.sdb.getAll('CouncilMember') || []
  members = members = members.sort((a, b) => b.votes - a.votes).slice(0, 3)
  return members.find(i => i.address === address)
}


module.exports = {
  async register(address) {

    const regist = await app.sdb.findAll('CouncilVote', { condition: { type: 0, sign: 1 } })
    if (regist.length > 0) return "Still people who have not passed"    

    address = address.replace(/\s/g, "");
    if (!address) return 'Account not found'   
    let Accountlist= await app.sdb.load('Account', address);
    const name_account=Accountlist.name;
    if (!name_account) return 'Account has not a name'

    let isAccount = await app.sdb.findAll('CouncilMember', { condition: { address: address } });
    if (isAccount.length>0) return 'Account already exists'

    let voters = this.sender.name
    if (!this.sender.name) {//地址
      let add = this.sender.address
      let concils = await app.sdb.findAll('CouncilMember', { condition: { address: add } });
      if (concils) voters = concils[0].name
    }
    app.sdb.create('CouncilMember', {
      address: address,
      name: name_account,
      tid: this.trs.id,
      votes: 1,      
      status: 0
    })

    app.sdb.create('CouncilVote', {
      voter: voters,//投票人
      targets: name_account,//注册的人
      type: 0,//类型为注册
      sign: 1,//未生效
      transid: this.trs.id
    })

    return null
  },

  // 移除成员 type=1
  async removeMember(targets) {
    const remove = await app.sdb.findAll('CouncilVote', { condition: { type: 1, sign: 1 } })
    if (remove.length > 0) return "Still people who have not passed"
    let voters = this.sender.name
    if (!this.sender.name) {//地址
      let address = this.sender.address
      let concils = await app.sdb.findAll('CouncilMember', { condition: { address: address } });
      if (concils) voters = concils[0].name
      else return 'Permission denied'
    }
    app.sdb.create('CouncilVote', {
      voter: voters,//投票人
      targets: targets,//移除人员
      type: 1,
      sign: 1,//未生效
      transid: this.trs.id
    })

    return null
  },


  //增加用户的投票 ---修改council_votes表中voter字段长度为250
  async vote(targets, member) {

    //if (!isCouncilMember(this.sender.address)) return 'Permission denied'
    let vote = member
    if (vote.length > 20) {//地址
      let concils = await app.sdb.findAll('CouncilMember', { condition: { address: vote } });
      if (concils) vote = concils[0].name
      else return 'Permission denied'
    }
    if (!targets || typeof targets !== 'string') return 'Invalid parameters'

    const condition = {}
    condition.status = 1
    const count = await app.sdb.count('CouncilMember', condition);


    //注册用户
    let votement = await app.sdb.findAll('CouncilVote', { condition: { targets: targets, type: 0, sign: 1 } })

    if (votement) {//不存在
      let voters = votement[0].voter.split(',');//查看这个人是不是投过票
      let tids = votement[0].transid
      if (voters.indexOf(vote) > -1) return '已经投过票'

      app.sdb.increase('CouncilMember', { votes: +1 }, { name: targets })//增量为1，每次+1
      const votestring = votement[0].voter + `,${vote}`;
      app.sdb.update('CouncilVote', { voter: votestring }, { transid: tids });

      if (((voters.length + 1) / count) >= 2 / 3) {//投票超过2/3 开始生效
        app.sdb.update('CouncilVote', { sign: 0 }, { transid: tids })
        app.sdb.update('CouncilMember', { status: 1 }, { name: targets })
      }
    }

  },


  //删除用户时的投票
  async deleteVote(targets, member) {
    //if (!isCouncilMember(this.sender.address)) return 'Permission denied'
    let vote = member
    if (vote.length > 20) {//地址
      let concils = await app.sdb.findAll('CouncilMember', { condition: { address: vote } });
      if (concils) vote = concils[0].name
      else return 'Permission denied'
    }
    if (!targets || typeof targets !== 'string') return 'Invalid parameters'


    const condition = {}
    condition.status = 1
    const count = await app.sdb.count('CouncilMember', condition);

    const votement = await app.sdb.findAll('CouncilVote', { condition: { targets: targets, sign: 1, type: 1 } })

    if (votement) {
      let voters = votement[0].voter.split(',');//查看这个人是不是投过票
      const id = votement[0].transid
      if (voters.indexOf(vote) > -1) return '已经投过票'

      const votestring = votement[0].voter + `,${vote}`;
      app.sdb.update('CouncilVote', { voter: votestring }, { transid: id })

      if (((voters.length + 1) / count) >= 2 / 3) {//投票超过2/3 开始生效
        app.sdb.update('CouncilVote', { sign: 0 }, { transid: id })
        //app.sdb.update('CouncilMember', { status: 0 }, { name: targets })
        app.sdb.del('CouncilMember', { name: targets })
      }
    }
  },

  // 理事会成员发起交易
  async initiatePayment(recipient, amount, currency, remarks) {
    // 有未完成的交易时，无法进行下一个交易
    const countTran = await app.sdb.findAll('CouncilTransaction', { condition: { pending: 1 } });
    if (countTran.length > 0) return 'There is a deal in progress'

    const recipientAccount = await app.sdb.load('Account', recipient)
    if (!recipientAccount) return 'Recipient account not found'
    //查询理事会账号的余额
    const COUNCIL_ADDRESS = 'GADQ2bozmxjBfYHDQx3uwtpwXmdhafUdkN'
    const councilAccount = await app.sdb.load('Account', COUNCIL_ADDRESS)
    if (!councilAccount) return 'Council account not found'
    if (councilAccount.xas < amount) return 'Insufficient balance'

    let address = this.sender.address
    let concils = await app.sdb.findAll('CouncilMember', { condition: { address: address } });
    if (!concils) return 'Permission denied'

    if (!app.util.address.isNormalAddress(recipient)) return 'Invalid recipient address'
    app.validate('amount', amount)
    if (currency !== 'XAS') return 'UIA token not supported'
    if (typeof remarks !== 'string' || remarks.length > 256) return 'Invalid remarks'

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
      signId: this.sender.address,
      //session,
    })
  },

  //council_transaction表添加字段signId varchar（250）
  async signPayment(tid) {//签名交易

    let address = this.sender.address
    let concils = await app.sdb.findAll('CouncilMember', { condition: { address: address } });
    if (!concils) return 'Permission denied'
    //if (!isCouncilMember(this.sender.address)) return 'Permission denied'

    const payment = await app.sdb.load('CouncilTransaction', tid)
    if (!payment) return 'Payment not found'

    if (payment.pending === 0) return 'Payment already finished'

    //todo 是否已投过票
    //var address = this.sender.address;
    if (payment.signId) {
      let comments = payment.signId.split(',');
      if (comments.indexOf(address) > -1) return 'Already voted'
    }

    const height = modules.blocks.getLastBlock().height
    if (!!payment.expiredAt && height >= payment.expiredAt) return 'Payment expired'

    //const session = modules.council.getCouncilInfo().session
    //if (session !== payment.session) return 'Session expired'

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

    const condition = {}
    condition.status = 1
    const count = await app.sdb.count('CouncilMember', condition);

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
