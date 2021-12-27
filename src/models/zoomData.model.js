const {Schema,model} = require('mongoose');
const toJSON = require('./toJSON.plugin');

const zoomDataSchema = Schema(
    {
  "uuid": {
    "type": "String"
  },
  "id": {
    "type": "Number"
  },
  "host_id": {
    "type": "String"
  },
  "host_email": {
    "type": "String"
  },
  "topic": {
    "type": "String"
  },
  "type": {
    "type": "Number",
    "min":[1,"Valid Numbers are 1,2 and 3"],
    "max":[3,"Valid Numbers are 1,2 and 3"]
  },
  "status": {
    "type": "String"
  },
  "timezone": {
    "type": "String"
  },
  "created_at": {
    "type": "Date"
  },
  "start_url": {
    "type": "String"
  },
  "join_url": {
    "type": "String"
  },
  "password": {
    "type": "String"
  },
  "h323_password": {
    "type": "String"
  },
  "pstn_password": {
    "type": "String"
  },
  "encrypted_password": {
    "type": "String"
  },
  "settings": {
    "host_video": {
      "type": "Boolean"
    },
    "participant_video": {
      "type": "Boolean"
    },
    "cn_meeting": {
      "type": "Boolean"
    },
    "in_meeting": {
      "type": "Boolean"
    },
    "join_before_host": {
      "type": "Boolean"
    },
    "jbh_time": {
      "type": "Number"
    },
    "mute_upon_entry": {
      "type": "Boolean"
    },
    "watermark": {
      "type": "Boolean"
    },
    "use_pmi": {
      "type": "Boolean"
    },
    "approval_type": {
      "type": "Number"
    },
    "audio": {
      "type": "String"
    },
    "auto_recording": {
      "type": "String"
    },
    "enforce_login": {
      "type": "Boolean"
    },
    "enforce_login_domains": {
      "type": "String"
    },
    "alternative_hosts": {
      "type": "String"
    },
    "close_registration": {
      "type": "Boolean"
    },
    "show_share_button": {
      "type": "Boolean"
    },
    "allow_multiple_devices": {
      "type": "Boolean"
    },
    "registrants_confirmation_email": {
      "type": "Boolean"
    },
    "waiting_room": {
      "type": "Boolean"
    },
    "request_permission_to_unmute_participants": {
      "type": "Boolean"
    },
    "registrants_email_notification": {
      "type": "Boolean"
    },
    "meeting_authentication": {
      "type": "Boolean"
    },
    "encryption_type": {
      "type": "String"
    },
    "approved_or_denied_countries_or_regions": {
      "enable": {
        "type": "Boolean"
      }
    },
    "breakout_room": {
      "enable": {
        "type": "Boolean"
      }
    },
    "alternative_hosts_email_notification": {
      "type": "Boolean"
    },
    "device_testing": {
      "type": "Boolean"
    },
    "focus_mode": {
      "type": "Boolean"
    },
    "private_meeting": {
      "type": "Boolean"
    }
  },
  "pre_schedule": {
    "type": "Boolean"
  }
}
)

zoomDataSchema.plugin(toJSON)

const ZoomData=model('ZoomData',zoomDataSchema)

module.exports=ZoomData