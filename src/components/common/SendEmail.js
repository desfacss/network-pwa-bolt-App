import { Resend } from 'resend';
import { store } from 'store';
import { REACT_APP_RESEND_API_KEY, REACT_APP_SUPABASE_BASE_URL, REACT_APP_RESEND_FROM_EMAIL } from 'configs/AppConfig';
import { notification } from 'antd';

// const resend = new Resend('re_VTPe8tkE_GRsdfSsRF2'); // Replace 'YOUR_API_KEY' with your Resend API key
// const resend = new Resend(REACT_APP_RESEND_API_KEY); // Replace 'YOUR_API_KEY' with your Resend API key
const resend = new Resend(REACT_APP_RESEND_API_KEY); // Replace 'YOUR_API_KEY' with your Resend API key


// export const sendEmail = async (emails) => {
//     try {
//         // const emails = [
//         //     {
//         //         from: 'team@optionsify.com',
//         //         to: ['ratedrnagesh28@gmail.com', 'ganeshmr3003@gmail.com', 'optionsalgotrade@gmail.com'],
//         //         subject: 'Subject for Users',
//         //         html: '<p>Hello User 1, this is your message.</p>',
//         //     },
//         //     {
//         //         from: 'team@optionsify.com',
//         //         to: 'ravishankar.s@gmail.com',
//         //         subject: 'Subject for User 2',
//         //         html: '<p>Hello User 2, this is your message.</p>',
//         //     },
//         // ];

//         if (!Array.isArray(emails) || emails.length === 0) {
//             console.error('Emails array is empty or invalid');
//             return;
//         }
//         // const response = await fetch(`${"https://azzqopnihybgniqzrszl.supabase.co" || REACT_APP_SUPABASE_BASE_URL}/functions/v1/send_email`, {
//         const response = await fetch(`${"https://qpoxasghnbrrwmnxzyqk.supabase.co" || REACT_APP_SUPABASE_BASE_URL}/functions/v1/send_email`, {
//                 // https://qpoxasghnbrrwmnxzyqk.supabase.co/functions/v1/send_email

// //   curl -X POST \
// //   -H "Content-Type: application/json" \
// //   -H "Authorization: Bearer eyJh...............hhc2dobmJycn.........grhqiKqC2OA4RUY" \
// //   -d '[
// //     {
// //       "to": "ravishankar.s@gmail.com",
// //       "from": "ibcn2025@nagarathars.in",
// //       "subject": "Test Email 1",
// //       "html": "<p>This is a test email.</p>"
// //     },
// //     {
// //       "to": "ravi@zoworks.com",
// //       "from": "ibcn2025@nagarathars.in",
// //       "subject": "Test Email 2",
// //       "html": "<p>This is another test email.</p>"
// //     }
// //   ]' \
// //   https://qpoxasghnbrrwmnxzyqk.supabase.co/functions/v1/send_email
//             // const response = await fetch(`https://azzqopnihybgniqzrszl.supabase.co/functions/v1/send_email`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(emails),
//         });

//         if (!response.ok) {
//             throw new Error('Failed to send emails');
//         }

//         const data = await response.json();
//         console.log('Emails sent successfully:', data);
//     } catch (error) {
//         console.error('Error sending emails:', error);
//     }
// };

export const sendEmail = async (emails) => {
    try {
        if (!Array.isArray(emails) || emails.length === 0) {
            console.error('Emails array is empty or invalid');
            notification.error({
                message: 'Error',
                description: 'Emails array is empty or invalid.',
            });
            return;
        }

        const supabaseUrl = process.env.REACT_APP_SUPABASE_BASE_URL || "https://qpoxasghnbrrwmnxzyqk.supabase.co";
        const supabaseFunctionUrl = `${supabaseUrl}/functions/v1/send_email`;
        const supabaseApiKey = process.env.REACT_APP_SUPABASE_ANON_KEY; // Or use a service role key if needed

        const response = await fetch(supabaseFunctionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(supabaseApiKey && { Authorization: `Bearer ${supabaseApiKey}` }), // Conditionally add auth
            },
            body: JSON.stringify(emails),
        });

        if (!response.ok) {
            let errorMessage = 'Failed to send emails';
            try {
                const errorData = await response.json();
                errorMessage = errorData?.message || errorMessage;
            } catch (jsonError) {
                // If JSON parsing fails, use the status text
                errorMessage = response.statusText || errorMessage;
            }
            console.error('Failed to send emails:', errorMessage);
            notification.error({
                message: 'Error',
                description: errorMessage,
            });
            throw new Error(`Failed to send emails: ${errorMessage}`);
        }

        const data = await response.json();
        console.log('Emails sent successfully:', data);
        notification.success({
            message: 'Success',
            description: data.message || 'Emails sent successfully.',
        });
        return data;
    } catch (error) {
        console.error('Error sending emails:', error);
        notification.error({
            message: 'Error',
            description: error.message || 'An unexpected error occurred while sending emails.',
        });
        throw error;
    }
};

export const generateEmailData = (type, action, details) => {
    const {
        username, approverUsername,
        approverEmail, hrEmails, userEmail,
        applicationDate,
        // submittedTime, reviewedTime,
        comment,
    } = details;

    const state = store.getState();
    const { submissionEmail = true, reviewEmail = true } = state?.auth?.session?.user?.organization?.timesheet_settings?.approvalWorkflow || {};
    let subject, body, recipients;

    // Determine subject and body content
    switch (type) {
        case "timesheet":
            if (action === "Submitted") {
                if (!submissionEmail) return;
                subject = `Timesheet Submitted by ${username}`;
                body = `Timesheet ${applicationDate} is submitted by ${username}.`;
                // recipients = [approverEmail, ...hrEmails];
                //For Local Testing
                recipients = [approverEmail];
            } else if (["Approved", "Rejected"].includes(action)) {
                if (!reviewEmail) return;
                subject = `Timesheet ${action} by ${approverUsername}`;
                body = `Your Timesheet ${applicationDate} is ${action.toLowerCase()} by ${approverUsername} ${comment ? ` with the following comment: ${comment}` : ""}`;
                recipients = [userEmail];
            }
            break;
        case "leave application":
            if (action === "Submitted") {
                if (!submissionEmail) return;
                subject = `Leave Application Submitted by ${username}`;
                body = `${username} is submitting ${type} ${applicationDate} for approval.`;
                // recipients = [approverEmail, ...hrEmails];
                recipients = [approverEmail];
            } else if (["Approved", "Rejected"].includes(action)) {
                if (!reviewEmail) return;
                subject = `Leave Application ${action} by ${approverUsername}`;
                body = `Your leave application ${applicationDate} is ${action.toLowerCase()} ${comment ? ` with the following comment: ${comment}` : ""}`;
                recipients = [userEmail];
            }
            break;
        case "expenses claim":
            if (action === "Submitted") {
                if (!submissionEmail) return;
                subject = `Expenses Claim Submitted by ${username}`;
                body = `${username} is submitting ${type} ${applicationDate} for approval.`;
                // recipients = [approverEmail, ...hrEmails];
                recipients = [approverEmail];
            } else if (["Approved", "Rejected"].includes(action)) {
                if (!reviewEmail) return;
                subject = `Expenses Claim ${action} by ${approverUsername}`;
                // body = `${type} ${applicationDate} ${action.toLowerCase()} by ${approverUsername} on ${reviewedTime}${comment ? ` with the following comment: ${comment}` : ""}`;
                body = `Your ${type} ${applicationDate} is ${action.toLowerCase()} ${comment ? `<br/>With the following comment: ${comment}` : ""}`;
                recipients = [userEmail];
            }
            break;

        default:
            throw new Error("Invalid type or action");
    }

    // Return the email data object
    return {
        // from: process.env.REACT_APP_RESEND_FROM_EMAIL,
        from: `UKPE Timesheet <${REACT_APP_RESEND_FROM_EMAIL}>`,
        to: recipients,
        subject: subject,
        html: `<p>${body}</p><p>If you are not the intended recipient, you can safely ignore this message or contact your HR for assistance.
</p><p>Best Regards,<br/>UKPE Global Admin Team</p>`,
    };
};

