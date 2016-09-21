'use strict'

/*
  UserPlan is a collection that handles the information about which plans are associated to each user
*/
const driverStore = require('../../connectors/corbel')
const assert = require('assert-plus')
const trace = require('debug')('trace')
const error = require('debug')('error')
const collection = 'books:UserPlan'

/*
  Returns the plans associated to a user
*/
function getUserPlans (domain, userId) {
  trace('Getting user plans %s', userId)

  return driverStore.get()
    .domain(domain)
    .resources
    .collection(collection)
    .get({
      query: [{
        '$eq': {
          'userId': userId
        }
      }]
    })
    .then(function (response) {
      trace('user plan fetched')
      return response.data
    })
}

/*
  Adds a new plan to a user.
*/
function addUserPlan (driver, userId, planId, options, next) {
  assert.string(userId, 'userId')
  assert.string(planId, 'planId')
  assert.object(options, 'options')

  trace('adding user plan %s %s', userId, planId)

  let itemId = getUserPlanId(userId, planId)

  let initialPlanData = {
    id: itemId,
    userId: userId,
    planId: planId,
    state: 'active'
  }

  let planBody = Object.assign({}, initialPlanData, options)

  driver
    .resources
    .collection(collection)
    .add(planBody)
    .then((resp) => next(null, resp.data))
    .catch((err) => next(err.data, null))
}

/*
  Removes the item for the collection
*/
function removeUserPlan (driver, userId, planId) {
  assert.string(userId)
  assert.string(planId)

  trace('Removing user plan %s %s', userId, planId)

  return driver
    .resources
    .resource(collection, getUserPlanId(userId, planId))
    .delete()
}

function getUserPlanId (userId, planId) {
  return userId + '-' + planId
}

module.exports = {
  get: getUserPlans,
  add: addUserPlan,
  remove: removeUserPlan
}
