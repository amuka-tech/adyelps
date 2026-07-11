import nodemailer from 'nodemailer';

// In a real production app, you would use environment variables:
// process.env.SMTP_HOST, process.env.SMTP_PORT, process.env.SMTP_USER, process.env.SMTP_PASS

// For development, we're using Ethereal Email which intercepts emails and allows us to view them online.
// Go to ethereal.email if you need to generate a new test account.
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'yhhf4hooiotdv6sj@ethereal.email',
        pass: 'm3JPWWqBRa9QyR5Djz'
    }
});

export async function sendEmail(to: string, subject: string, html: string) {
    try {
        const info = await transporter.sendMail({
            from: '"Adyel Alumni Support" <support@adyelalumni.com>', // sender address
            to, // list of receivers
            subject, // Subject line
            html, // html body
        });

        console.log("Message sent: %s", info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}
