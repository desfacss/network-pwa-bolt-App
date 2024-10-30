// import { Resend } from 'resend';

// const resend = new Resend('re_VTPe8tkE_GRAog5gbk5kxjhUKUVpSsRF2'); // Replace 'YOUR_API_KEY' with your Resend API key

// export const sendEmail = async () => {
//     try {
//         // Email data for the first user
//         const email1 = {
//             from: 'your-email@example.com', // Your sender email address
//             to: 'ratedrnagesh28@gmail.com', // Recipient 1 email
//             subject: 'Subject for User 1',
//             html: '<p>Hello User 1, this is your message.</p>',
//         };

//         // Email data for the second user
//         const email2 = {
//             from: 'your-email@example.com', // Your sender email address
//             to: 'ganeshmr3003@gmail.com', // Recipient 2 email
//             subject: 'Subject for User 2',
//             html: '<p>Hello User 2, this is your message.</p>',
//         };

//         // Send both emails in parallel
//         await Promise.all([resend.sendEmail(email1), resend.sendEmail(email2)]);

//         console.log('Emails sent successfully');
//     } catch (error) {
//         console.error('Error sending emails:', error);
//     }
// };

import { Resend } from 'resend';

const resend = new Resend('re_VTPe8tkE_GRAog5gbk5kxjhUKUVpSsRF2'); // Replace 'YOUR_API_KEY' with your Resend API key

export const sendEmail = async () => {
    try {
        // Email data for the first user
        const email1 = {
            from: 'your-email@example.com', // Your sender email address
            to: 'ratedrnagesh28@gmail.com', // Recipient 1 email
            subject: 'Subject for User 1',
            html: '<p>Hello User 1, this is your message.</p>',
        };

        // Email data for the second user
        const email2 = {
            from: 'your-email@example.com', // Your sender email address
            to: 'ganeshmr3003@gmail.com', // Recipient 2 email
            subject: 'Subject for User 2',
            html: '<p>Hello User 2, this is your message.</p>',
        };

        // Send both emails in parallel
        await Promise.all([resend.emails.send(email1), resend.emails.send(email2)]);

        console.log('Emails sent successfully');
    } catch (error) {
        console.error('Error sending emails:', error);
    }
};