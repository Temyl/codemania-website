import { validationPipe } from "@app/http/middlewares/validation.middleware";
import { BROKER_TOKENS, MODULE_TOKENS} from "@app/ioc/tokens";
import { inject } from "inversify";
import { controller, httpPost, request, requestBody } from "inversify-express-utils";
import { contactFormtDto } from "./dtos/contact-form.dto";
import { Request } from "express";
import { SuccessResponseDto } from "@app/http/dto/http-response.dto";
import { SendChamp } from "@app/modules/sendchamp";
import { Env } from "@app/internal/env";
import { ApplicationError } from "@app/internal/errors";
import { StatusCodes } from "http-status-codes";



@controller('/contact-form')
export class contactFormController {
    constructor(
        @inject(BROKER_TOKENS.SendChamp)
        private readonly sendChamp: SendChamp,
        @inject(MODULE_TOKENS.Env)
        private readonly env: Env
    ) {}

    @httpPost('/',
        validationPipe(contactFormtDto)
    )
    public async contactForm(
        @requestBody() payload: contactFormtDto,
        @request() req: Request,
    ) {
        if (!payload.email) {
            throw new ApplicationError(
                StatusCodes.BAD_REQUEST,
                'Company email is required for contact',
            );
        }

        const contactEmail = {
            to: [{ email: 'temmydun02@gmail.com' }],
            from: { email: `${this.env.get('SENDER_EMAIL')}` },
            subject: `New enquiry from ${payload.company_name}`,
            message_body: {
                type: 'html',
                value: `
                    <h1>New Contact Form Submission</h1>
                    <p>You have received a new message via the contact form on your website.</p>
                    <p><strong>Company Name:</strong> ${payload.company_name}</p>
                    <p><strong>Project Details:</strong> ${payload.project_details}</p>
                    <p><strong>Contact Email:</strong> ${payload.email}</p>
                `
            }
        };

        try {
            await this.sendChamp.sendEmail(contactEmail);
            return new SuccessResponseDto();
        } catch (error) {
            console.error('Email sending error:', error);
            throw new ApplicationError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                'Failed to send email. Please try again.',
            );
        }
    }
}
