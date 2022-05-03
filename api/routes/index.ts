import auth from "../routes/auth"
import api from "../routes/api"
import {handleRoutes} from "./handleRoutes"
export default (app) => {
	const routes = [
		...auth,
		...api,
	]

	handleRoutes({routes,app})
}