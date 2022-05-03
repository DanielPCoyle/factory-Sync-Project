import { DB } from "../../../server/models";
import bcrypt from "bcrypt";
import { getCall } from "../../../services/api/get";
import util from 'util';
import { exec } from "child_process";
import fs from "fs";

// TODO: Add to readme. 
// Appends additional data to the login that does not affect the core login feature. 
let additionalLogin
try {
     additionalLogin = require('../../../controller/auth/additionalLoginData').default;
} catch (ex) {
    additionalLogin = ()=>({logic:"none"})
}

const ex = util.promisify(exec);
export default async (req, res) => {
	const sign = require('jwt-encode');
	const { email, password } = req.body;

	if (!email || !password) {
		throw new Error('Please supply an email and password');
	}
	let user = await DB.user.findAll({ where: { email: email } });
	if (!user[0]) {
		throw new Error('We could not find your user');
	}

	user = await getCall({
		params: {
			model: "user",
			id: user[0].id
		},
		query: {}
	});

	if (!user.password) {
		throw new Error('Invalid username or password. No password set');		
	}

	if (user) {
		var checked = await bcrypt.compare(password, user.password);
		if (!checked) {
			throw new Error("Password is incorrect");
		}
	
		const secret = 'secret';
		const jwt = sign({
			"status": checked, 
			user: {
				...{
					name: user.name,
					id: user.id,
					type: user.type,
					email: user.email,
					photo: user.photo,
					created_at: new Date(),
				},
				...await additionalLogin(user),
			}
		},secret)
		res.send({ token: jwt });
	}
};
