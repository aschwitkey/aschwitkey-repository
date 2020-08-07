module.exports = {
  table: 'council_votes',
  tableFields: [
    { name: 'voter', type: 'String', length: 250, not_null: true },
    { name: 'session', type: 'Number' },
    { name: 'targets', type: 'String', length: 150, not_null: true },
    { name: 'sign', type: 'Number' },
    { name: 'type', type: 'Number' },
    { name: 'transid', type: 'String', length: 100, not_null: true, primary_key: true }
  ]
}
