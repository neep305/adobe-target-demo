require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;
const indexRouter = require('./routes/index');
const productRouter = require('./routes/product');


const targetSdk = require('@adobe/target-nodejs-sdk');
const { TargetConfig } = require('./configs/target');

const CONFIG = {
    client: process.env.CLIENT_CODE,
    organizationId: process.env.IMS_ORG,
    decisioningMethod: process.env.DECISIONING_METHOD,
    events: {
        clientReady: () => {
            console.log('clientReady');
            startApp();
        },
        onBeforeRequest: (request) => {
            console.log('onBeforeRequest', request);
        },

        onAfterResponse: (response) => {
            console.log('onAfterResponse', response);
        },
        onError: (error) => {
            console.log('onError', error);
        },
        artifactDownloadSucceeded: (artifact) => {
            console.log('artifactDownloadSucceeded', artifact);
        },
        artifactDownloadFailed: (error) => {
            console.log('artifactDownloadFailed', error);
        },
        
    }
}

const targetClient = targetSdk.create(CONFIG);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.static('uploads'));
app.use(express.static('views'));
app.use(express.static('node_modules'));

app.set('view engine', 'pug');
app.set('views', './views');

app.use('/', indexRouter);
app.use('/product', productRouter);

app.use((req, res, next) => {
    next(createError(404));
});

app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';
    res.status(err.statusCode).json({
        message: err.message,
    });
});

// onArtifactDownloadSucceeded
const onArtifactDownloadSucceeded = (event) => {
    console.log('Target Artifact Download Succeeded', event.artifictLocation);

    // 파일 쓰기
    fs.writeFile('target-rules.json', JSON.stringify(event.artifactPayload), 'utf8', (err) => {
        if (err) {
            console.error('Failed to write target-rules.json', err);
        } else {
            console.log('target-rules.json written successfully');
        }
    });

}

// onArtifactDownloadFailed
const onArtifactDownloadFailed = (event) => {
    console.log(`The local decisioning artificat failed to download from ${event.artifictLocation} with the following error: ${event.error.message}`);
}

// startApp
const startApp = () => {
    console.log('startApp');
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});





