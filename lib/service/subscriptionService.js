'use strict'

// const subscriptionMovistarProductId = 'NUBICO-SPAIN-SUBSCRIPTION-EXTERNAL'

// const subscriptionCardProductId = 'NUBICO-SPAIN-SUBSCRIPTION'
const driverStore = require('../../connectors/corbel')
const async = require('async')
const Boom = require('boom')
const debug = require('debug')('service')
const error = require('debug')('error')
const trace = require('debug')('trace')

// Services
const userPlanService = require('./userPlanService')


function addSubscription (driver, domain, userId, planId, options, done) {
  let opt = Object.assign({}, defaultOptions, options)

  trace('adding subscription %s %s %s', domain, userId, planId)

  async.parallel([
    function loadPlan (next) {
      // Check if the plan ID exists and fetch it
      planService.get(domain, planId, (err, plan) => {
        if (err) {
          error('plan fetch error %s', err.status)
          return next(err, null)
        }

        trace('Plan fetched')

        next(null, plan)
      })
    },
    function loadUserPlans (next) {
      // Check if the user has another plan in order to allow trial
      userPlanService.get(domain, userId)
        .then(function (userPlans) {
          trace('user plans fetched')
          return next(null, userPlans)
        })
        .catch((err) => {
          error('Error fetching user plans')
          next(err, null)
        })
    },
    function loadPaymentMethods (next) {
      // If the user has no card data, reject
      purchaseService.getPaymentMethods(userId)
        .then(function (paymentMethods) {
          trace('payment methods fetched')
          if (!paymentMethods) {
            trace('user with no payment methods')
            return next(Boom.preconditionRequired('The user must have a payment method'))
          }
          next(null, paymentMethods[0].id)
        })
        .catch((err) => {
          error('Error fetching payment methods')
          next(err, null)
        })
    },
    function loadUserBilling (next) {
      // If the user has no card data, reject
      purchaseService.getUserBilling(domain, userId)
        .then(function (billingInfo) {
          trace('billing info fetched')
          if (!billingInfo) {
            trace('user without billing info')
            return next(Boom.preconditionRequired('The user must have the billing information'))
          }
          next(null, billingInfo)
        })
        .catch((err) => {
          error('Error fetching user billing info')
          next(err, null)
        })
    }
  ], function (err, results) {
    if (err) {
      error('Subscription add preconditions failed')
      return done(err, null)
    }
    trace('all preconditions met')
    // All preconditions ok
    var plan = results[0]
    var userPlans = results[1]
    var paymentMethodId = results[2]
    var userBillingInfo = results[3]

    if (userPlans.length || !plan.trial) {
      trace('no trial will be applied')
      // Can not have trial
      // TODO implement purchase well
      purchaseService.purchase(driver, 'booqs:nubico:es', userId, plan.productId, paymentMethodId, userBillingInfo, (err, resp) => {
        if (err) {
          error('Error purchasing plan')
          return done(err, null)
        }

        trace('purchase  done')

        // Create user plan
        userPlanService.add(driver, userId, planId, {
          trial: false
        }, (err, data) => {
          // Something
          if (err) {
            error('Error adding user plan')
            return done(err, null)
          }

          // Everything ok
          trace('Plan correctly created')
          done(null, data)
        })
      })
    } else {
      // Can have trial

      trace('trial will be applied')

      trialService.add(userId, plan, (err, trialData) => {
        if (err) {
          error('Error creating trial')
          return done(err, null)
        }

        userPlanService.add(driver, userId, planId, {
          trial: trialData
        }, (err, data) => {
          if (err) {
            error('Error saving userPlan')
            return done(err, null)
          }

          // Everything ok
          trace('Plan correctly created')
          done(null, data)
        })
      })
    }
  })
}

// Removes a subscription for a user,
// For ex: 'NUBICO-SPAIN-SUBSCRIPTION'
function removeSubscription (driver, userId, planId, done) {
  // If credit card
  //  get payment plan for user id and subscription id
  //  cancel payment plan
  // Remove user assets
  // Send event to bigquery
  // Send notification email with admin driver driverStore.get()
  //
}

function getSubscriptionsForUser (driver, userId, done) {
  // Return an array of subscriptions: For ex:
  // ['NUBICO-SPAIN-SUBSCRIPTION', 'TRES-REVISTAS']
}

// Returns the list of existing subscriptions
function listSubscriptions (driver, done) {
  driverStore.get()
    .resources
    .collection('books:Subscriptions')
    .get({
      pagination: {
        pageSize: 50,
        page: 0
      }
    })
    .then(function (response) {
      done(null, response.data)
    })
    .catch(done)
}

module.exports = {
  add: addSubscription,
  remove: removeSubscription,
  list: listSubscriptions,
  get: getSubscriptionsForUser
}
