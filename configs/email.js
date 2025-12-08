import * as Brevo from '@getbrevo/brevo';

// Initialize Brevo email service
let brevoClient = null;

if (process.env.BREVO_API_KEY) {
    brevoClient = new Brevo.TransactionalEmailsApi();

    // Set API key using default authentication
    brevoClient.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

    console.log('📧 Email service initialized (Brevo)');
} else {
    console.log('⚠️  Email service disabled (BREVO_API_KEY not configured)');
}

export default brevoClient;
