module.exports = {
  table: 'council_transactions',
  tableFields: [
    { name: 'tid', type: 'String', length: 64, primary_key: true },
    { name: 'currency', type: 'String', length: 30, not_null: true },
    { name: 'amount', type: 'String', length: 50, not_null: true },
    { name: 'timestamp', type: 'Number', index: true },
    { name: 'recipient', type: 'String', length: 50 },
    { name: 'signs', type: 'Number', default: 0 },
    { name: 'signId', type: 'String', length: 250 },
    { name: 'nosignId', type: 'String', length: 250 },
    { name: 'nosigns', type: 'Number', default: 0 },
    { name: 'pending', type: 'Number', index: true },
    { name: 'remarks', type: 'String', length: 256 },
    { name: 'expiredAt', type: 'BigInt' },
    { name: 'session', type: 'Number', index: true }
  ]
}
