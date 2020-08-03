
let modules
let self
const priv = {}
const shared = {}

priv.loaded = false

// const COUNCIL_CONFIG = {
//   startHeight: 1,
//   electionDuration: 21,
//   servingDuration: 105,
// }
const COUNCIL_CONFIG = {
  startHeight: 9476110,
  electionDuration: 25920,
  servingDuration: 1576800,
}

function Council(cb, scope) {
  library = scope
  self = this
  priv.attachApi()

  setImmediate(cb, null, self)
}

// priv methods
priv.attachApi = () => {
  const router = new Router()

  router.use((req, res, next) => {
    if (modules) return next()
    return res.status(500).send({ success: false, error: 'Blockchain is loading' })
  })

  router.map(shared, {
    'post /': 'addCouncil',
    'post /transCouncil': 'transCouncil',
  })

  router.use((req, res) => {
    res.status(500).send({ success: false, error: 'API endpoint not found' })
  })

  library.network.app.use('/api/council', router)
  library.network.app.use((err, req, res, next) => {
    if (!err) return next()
    library.logger.error(req.url, err.toString())
    return res.status(500).send({ success: false, error: err.toString() })
  })

}

Council.prototype.sandboxApi = (call, args, cb) => {
  sandboxHelper.callMethod(shared, call, args, cb)
}

Council.prototype.onBind = (scope) => {
  modules = scope
}

Council.prototype.getCouncilInfo = () => {
  const height = modules.blocks.getLastBlock().height
  const sessionDuration = COUNCIL_CONFIG.electionDuration + COUNCIL_CONFIG.servingDuration
  const session = Math.floor((height - COUNCIL_CONFIG.startHeight) / sessionDuration) + 1
  const sessionPosition = height - (session - 1) * sessionDuration - COUNCIL_CONFIG.startHeight
  const status = sessionPosition < COUNCIL_CONFIG.electionDuration ? 0 : 1
  const sessionBegin = COUNCIL_CONFIG.startHeight + (session - 1) * sessionDuration
  const sessionEnd = sessionBegin + sessionDuration - 1
  return {
    electionDuration: COUNCIL_CONFIG.electionDuration,
    servingDuration: COUNCIL_CONFIG.servingDuration,
    session,
    status,
    sessionBegin,
    sessionEnd,
    currentHeight: height,
  }
}

Council.prototype.addCouncil = () => {

}

Council.prototype.transCouncil = (req, cb) => {
  const query = req.body

  const condition = {}
  if (query.senderId) {
    condition.senderId = query.senderId
  }
  if (query.type) {
    condition.type = Number(query.type)
  }
  if (query.recipientId) {
    condition.recipientId = query.recipientId
  }

  (async () => {
    try {
      const count = await app.sdb.count('CouncilMember');
      let councils = await app.sdb.find('CouncilMember')
      return cb(null, { councils, count })
    } catch (e) {
      app.logger.error('Failed to get CouncilMember', e)
      return cb(`System error: ${e}`)
    }
  })()
}

Council.prototype.cleanup = (cb) => {
  priv.loaded = false
  cb()
}

module.exports = Council
