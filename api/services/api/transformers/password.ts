import bcrypt from 'bcrypt';
import passwordValidator from 'password-validator';
const saltRounds = 10;

// Create a schema for password
var schema = new passwordValidator();

// Add properties to it
schema
.is().min(8)                                    // Minimum length 8
.is().max(100)                                  // Maximum length 100
.has().uppercase()                              // Must have uppercase letters
.has().lowercase()                              // Must have lowercase letters
.has().digits(2)                                // Must have at least 2 digits
.has().not().spaces()                           // Should not have spaces
.is().not().oneOf(['Passw0rd', 'Password123','Password1']); // Blacklist these values

export const password = async (postData)=>{
	const {field,data} = postData;
	const value = data[field];
	const passCheck = schema.validate(value)
	if(!passCheck){
		const reasonsWhy:any = schema.validate(value, { list: true });
		const reasons = reasonsWhy.map((why)=>{
			switch(why) {
			  case 'oneOf':
			    return "Your password is one of the passwords on our blacklist. please choose another password"
			    break;
			  default:
			    return "Your password is not strong enough"
			}
		})
		return {
			errors:reasons
		}	
	}
	const hash = await bcrypt.hash(value, saltRounds)
	const nValue = hash;
	data[field] = nValue;
	return data
}