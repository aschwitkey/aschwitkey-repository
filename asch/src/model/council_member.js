module.exports = {
  table: 'council_members',
  memory: true,
  tableFields: [
    { name: 'name', type: 'String', length: 50, primary_key: true, not_null: true },
    { name: 'address', type: 'String', length: 50, index: true, not_null: true },
    { name: 'tid', type: 'String', length: 64, unique: true, not_null: true },    
    { name: 'votes', type: 'BigInt' },
    { name: 'status', type: 'Number', default: 0},
  ]
}
