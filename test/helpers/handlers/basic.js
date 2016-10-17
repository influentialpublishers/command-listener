

const success  = (m, Status) => Status.Ok

const requeue  = (m, Status) => Status.Requeue

const priority = (m, Status) => Status.PriorityRequeue(1)

const failed   = (m, Status) => Status.Fail


module.exports = {
  success
, requeue
, priority
, failed
}
