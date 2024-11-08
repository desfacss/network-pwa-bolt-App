export const sendBatchEmail = async () => {
    try {
        const emails = [
            {
                from: 'Acme <onboarding@resend.dev>',
                to: ['ratedrnagesh28@gmail.com'],
                subject: 'Subject for User 1',
                html: '<p>Hello User 1, this is your message.</p>',
            },
            {
                from: 'Acme <onboarding@resend.dev>',
                to: ['ganeshmr3003@gmail.com'],
                subject: 'Subject for User 2',
                html: '<p>Hello User 2, this is your message.</p>',
            }
        ];

        const response = await fetch('https://azzqopnihybgniqzrszl.supabase.co/functions/v1/send_email', {
            method: 'POST',
            headers: {
                // 'Authorization': `Bearer YOUR_SUPABASE_ANON_KEY`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emails),
        });

        if (!response.ok) {
            throw new Error('Failed to send emails');
        }

        console.log('Emails sent successfully');
    } catch (error) {
        console.error('Error sending emails:', error);
    }
};

