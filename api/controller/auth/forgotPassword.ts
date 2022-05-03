import putCall from "../../../services/api/put";
import { getCall } from "../../../services/api/get";
import { sendEmail } from "../../../services/email";
import path from "path";
const env = require(path.resolve(`./src/__core/env/${process.env.NODE_ENV ?? "development"}.json`))
const sign = require('jwt-encode');

export default async (req, res) => {
	req.params.model = "user";
	req.query.filter = `email eq '${req.body.email}'`;
	const user = await getCall(req);

	if (!user) {
		res.json("User does not exisits");
		return;
	}
	const token = sign({ status: "pending", date: new Date() }, "secret");
	req.params.id = user[0].id;
	req.body = {
		token
	};

	sendEmail({
		subject: "Password Reset",
		text: "To reset your password, please click the link below",
		button: {
			text: "Reset Password",
			link: `${env.site_url}/password-reset/${user[0].email}/${token}`
		},
		user: user[0],
		to:user[0].email,
		from: `${env.site_title} ${env.email_from}`
	});
	res.json(await putCall(req));
};
