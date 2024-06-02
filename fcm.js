


var FCM = require('fcm-node');
var serverKey = 'BFAFzobwbvOH-5XaQaFoRZBrmjsR08CEf9uG_hIECQew_CwDWcmbwwk32z5z9OCui6VdhMLdPDSxn6rNUF1rpm0';
var fcm = new FCM(serverKey);

var message = {
to:'<DEVICE_TOKEN>',
    notification: {
        title: 'NotifcatioTestAPP',
        body: '{"Message from node js app"}',
    },

    data: { //you can send only notification or only data(or include both)
        title: 'ok cdfsdsdfsd',
        body: '{"name" : "okg ooggle ogrlrl","product_id" : "123","final_price" : "0.00035"}'
    }

};

fcm.send(message, function(err, response) {
    if (err) {
        console.log("Something has gone wrong!"+err);
        console.log("Respponse:! "+response);
    } else {
        // showToast("Successfully sent with response");
        console.log("Successfully sent with response: ", response);
    }

});

