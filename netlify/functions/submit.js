const TENANT_ID  = '0ee09618-8e36-48b0-b462-2ea263c9794f';
const USER_ID    = 'cba1bc6e-6f29-4cac-8651-5a209f7652c3';
const FORM_GUID_IN  = 'GJbgDjaOsEi0Yi6iY8l5T268ocspb6xMhlFaIJ92UsNUNUZPTlhMREFQUUpRTkhBOEs4QldLR1JJMC4u';
const FORM_GUID_OUT = 'GJbgDjaOsEi0Yi6iY8l5T268ocspb6xMhlFaIJ92UsNUNEhOSk1DUE9USTdUSFVZNkRKS1BCSlBGUC4u';
const Q_LOCATION = 'r97a3ba19fbac496b8a047671d1bfa433';
const Q_NAME     = 'r4af12f719c7e461d943b74d8a81f043c';

exports.handler = async function(event) {
  var headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: headers, body: 'Method not allowed' };
  }

  try {
    var data = JSON.parse(event.body);
    var type = data.type;
    var location = data.location;
    var name = data.name;

    if (!type || !location || !name) {
      return {
        statusCode: 400,
        headers: headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    var formGuid = type === 'Clock In' ? FORM_GUID_IN : FORM_GUID_OUT;
    var submitUrl = 'https://forms.office.com/formapi/api/' + TENANT_ID + '/users/' + USER_ID + '/forms(\'' + formGuid + '\')/responses';

    var now = new Date();
    var startDate = new Date(now.getTime() - 30000);

    var answers = JSON.stringify([
      { questionId: Q_LOCATION, answer1: location },
      { questionId: Q_NAME, answer1: name }
    ]);

    var payload = {
      startDate: startDate.toISOString(),
      submitDate: now.toISOString(),
      emailReceiptConsent: false,
      answers: answers
    };

    var response = await fetch(submitUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok || response.status === 201) {
      return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify({ success: true })
      };
    } else {
      var errText = await response.text();
      console.error('Forms error:', response.status, errText);
      return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify({ success: false, status: response.status, error: errText })
      };
    }

  } catch(e) {
    console.error('Function error:', e.message);
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({ error: e.message })
    };
  }
};
