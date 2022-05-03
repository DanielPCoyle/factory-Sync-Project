
import login from "../controller/auth/login";
import forgotPassword from "../controller/auth/forgotPassword";
import resetPassword from "../controller/auth/resetPassword";

export default [
	{
		method:"post",
		route:'/login', 
		function:login,
	},
	{
		method:"post",
		route:'/forgot-password',
		function:forgotPassword,
	},
	{
		method:"post",
		route:"/reset-password",
		function:resetPassword,
	}
]