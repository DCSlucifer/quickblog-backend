// Quick test script to verify Brevo API connection
import dotenv from 'dotenv';
import * as Brevo from '@getbrevo/brevo';

dotenv.config();

const testBrevoConnection = async () => {
    console.log('\n=== Testing Brevo API Connection ===\n');

    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
        console.log('❌ BREVO_API_KEY not found in .env');
        return;
    }

    console.log('📧 API Key found:', apiKey.substring(0, 20) + '...');
    console.log('📧 From Email:', process.env.EMAIL_FROM);
    console.log('📧 From Name:', process.env.EMAIL_FROM_NAME);

    try {
        // Test 1: Check account info
        const accountApi = new Brevo.AccountApi();
        accountApi.setApiKey(Brevo.AccountApiApiKeys.apiKey, apiKey);

        console.log('\n🔍 Testing API Key validity...');
        const accountInfo = await accountApi.getAccount();

        console.log('✅ API Key is VALID!');
        console.log('   - Email:', accountInfo.body.email);
        console.log('   - Plan:', accountInfo.body.plan?.[0]?.type || 'Unknown');
        console.log('   - Credits:', accountInfo.body.plan?.[0]?.credits || 'Unknown');

        // Test 2: Check senders
        console.log('\n🔍 Checking verified senders...');
        const sendersApi = new Brevo.SendersApi();
        sendersApi.setApiKey(Brevo.SendersApiApiKeys.apiKey, apiKey);

        const senders = await sendersApi.getSenders();
        console.log('📋 Verified senders:');

        if (senders.body.senders && senders.body.senders.length > 0) {
            senders.body.senders.forEach(sender => {
                console.log(`   - ${sender.email} (${sender.active ? '✅ Active' : '❌ Inactive'})`);
            });

            // Check if EMAIL_FROM is in the list
            const emailFrom = process.env.EMAIL_FROM;
            const isVerified = senders.body.senders.some(s => s.email === emailFrom && s.active);

            if (!isVerified) {
                console.log(`\n⚠️  WARNING: "${emailFrom}" is NOT verified as a sender!`);
                console.log('   Please verify this email in Brevo Dashboard:');
                console.log('   Settings → Senders, Domains & Dedicated IPs → Senders');
            } else {
                console.log(`\n✅ "${emailFrom}" is verified and ready to send!`);
            }
        } else {
            console.log('   ❌ No verified senders found!');
        }

    } catch (error) {
        console.log('\n❌ Error:', error.message);

        if (error.response) {
            console.log('   Status:', error.response.status);
            console.log('   Body:', JSON.stringify(error.response.body, null, 2));
        }

        if (error.message.includes('401')) {
            console.log('\n🔑 API Key is INVALID or REVOKED!');
            console.log('   Please create a new API key in Brevo Dashboard:');
            console.log('   Settings → SMTP & API → API Keys → Generate New Key');
        }
    }
};

testBrevoConnection();
