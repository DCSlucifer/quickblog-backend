import Brevo from '@getbrevo/brevo';

// Initialize Brevo email service
// If BREVO_API_KEY is not set, emails will be disabled (graceful degradation)
let brevoClient = null;

if (process.env.BREVO_API_KEY) {
    brevoClient = new Brevo.TransactionalEmailsApi();
    brevoClient.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
    console.log('📧 Email service initialized (Brevo)');
} else {
    console.log('⚠️  Email service disabled (BREVO_API_KEY not configured)');
}

export default brevoClient;
