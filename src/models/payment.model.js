const {Schema,model} = require('mongoose');
const toJSON = require('./toJSON.plugin');

const paymentSchema = Schema(
    {
  "id": {
    "type": "String",
    "unique":true
  },
   "studentID":[{type: Schema.Types.ObjectId, ref: 'User'}], 
   "appointmentID":[{type: Schema.Types.ObjectId, ref: 'Appointment'}], 
  "object": {
    "type": "String"
  },
  "refunded":{"type":Boolean, default:false},
  "amount": {
    "type": "Number"
  },
  "amount_capturable": {
    "type": "Number"
  },
  "amount_received": {
    "type": "Number"
  },
  "application": {
    "type": "Mixed"
  },
  "application_fee_amount": {
    "type": "Mixed"
  },
  "automatic_payment_methods": {
    "type": "Mixed"
  },
  "canceled_at": {
    "type": "Mixed"
  },
  "cancellation_reason": {
    "type": "Mixed"
  },
  "capture_method": {
    "type": "String"
  },
  "charges": {
    "object": {
      "type": "String"
    },
    "data": {
      "type": "Array"
    },
    "has_more": {
      "type": "Boolean"
    },
    "url": {
      "type": "String"
    }
  },
  "client_secret": {
    "type": "String"
  },
  "confirmation_method": {
    "type": "String"
  },
  "created": {
    "type": "Number"
  },
  "currency": {
    "type": "String"
  },
  "customer": {
    "type": "Mixed"
  },
  "description": {
    "type": "Mixed"
  },
  "invoice": {
    "type": "Mixed"
  },
  "last_payment_error": {
    "type": "Mixed"
  },
  "livemode": {
    "type": "Boolean"
  },
  "metadata": {},
  "next_action": {
    "type": "Mixed"
  },
  "on_behalf_of": {
    "type": "Mixed"
  },
  "payment_method": {
    "type": "Mixed"
  },
  "payment_method_options": {},
  "payment_method_types": {
    "type": [
      "String"
    ]
  },
  "processing": {
    "type": "Mixed"
  },
  "receipt_email": {
    "type": "Mixed"
  },
  "review": {
    "type": "Mixed"
  },
  "setup_future_usage": {
    "type": "Mixed"
  },
  "shipping": {
    "type": "Mixed"
  },
  "statement_descriptor": {
    "type": "Mixed"
  },
  "statement_descriptor_suffix": {
    "type": "Mixed"
  },
  "status": {
    "type": "String"
  },
  "transfer_data": {
    "type": "Mixed"
  },
  "transfer_group": {
    "type": "Mixed"
  }
}
)

paymentSchema.plugin(toJSON)

const Payment=model('Payment',paymentSchema)

module.exports=Payment