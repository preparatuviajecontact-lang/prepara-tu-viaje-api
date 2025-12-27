import 'dotenv/config';

const firebaseApiKey = process.env.REACT_APP_API_KEY;
const apiKeyLocationIq = process.env.REACT_APP_API_KEY_LOCATION_IQ;
const projectId = process.env.REACT_APP_PROJECT_ID;
const cneEmail = process.env.REACT_APP_CNE_EMAIL
const cnePassword = process.env.REACT_APP_CNE_PASSWORD

export { 
    apiKeyLocationIq, 
    projectId, 
    firebaseApiKey, 
    cneEmail,
    cnePassword
};