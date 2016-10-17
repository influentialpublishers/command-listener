
const daggy = require('daggy')


module.exports = Status = daggy.taggedSum({
  Ok              : []
, Fail            : []
, Requeue         : []
, PriorityRequeue : ['p']
})
