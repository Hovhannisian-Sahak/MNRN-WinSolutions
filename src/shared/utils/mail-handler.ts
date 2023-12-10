import config from 'config';
import axios from 'axios';
export const sendEmail = async (
  to: string,
  subject: string,
  templateName: string,
  templateVars: Record<string, any> = {},
) => {
  try {
    const form = new FormData();
    form.append('to', to);
    form.append('subject', subject);
    form.append('template_name', templateName);
    form.append(
      'from',
      'mailgun@sandbox0ca5370c0cda41aca4d3bc15a6aa6c45.mailgun.org',
    );
    Object.keys(templateVars).forEach((key) => {
      form.append(key, templateVars[key]);
    });

    const username = 'api';
    const password = config.get('emailService.privateKey');
    const token = Buffer.from(`${username}:${password}`).toString('base64');

    const response = await axios({
      method: 'post',
      url: `https://api.eu.mailgun.net/v3/${config.get(
        'emailService.testDomain',
      )}/messages`,
      headers: {
        Authorization: `Basic ${token}`,
        contentType: 'multipart/form-data',
      },
      data: form,
    });
    return response;
  } catch (error) {
    console.log(error);
  }
};
