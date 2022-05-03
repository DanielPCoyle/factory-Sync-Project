import putCall from "../../../services/api/put";
import { getCall } from "../../../services/api/get";
const sign = require('jwt-encode');

export default async (req, res) => {
	req.params.model = "user";
	req.query.filter = `email eq '${req.body.email}'`;
	req.query.expand = "pets";
	const user = await getCall(req);
	if (req.body.token !== user[0].token) {
		res.json({ status: "fail", message: "token is incorrect" });
		return;
	}
	const obj: any = {};
	obj.params = {
		id: user[0].id,
		model: "user"
	};
	obj.body = [{
		password: req.body.password,
		token: sign({ status: "confirmed", date: new Date() }, "secret")
	}];
	obj.query = {};
	console.log(obj)
	console.log( await putCall(obj) );
	res.json({ status: "success" });
};
