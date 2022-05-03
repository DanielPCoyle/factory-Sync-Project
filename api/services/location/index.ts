var axios = require('axios');
const key = 'AIzaSyBbmreYN--ueFujVLQZ8oD6TImkKIg4Q80'


export const getAddressDetails = async (placeId) => {
    var config = {
        method: 'get',
        url:`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=`+key,
        headers: { }
      };
      const response = await axios(config)
      const addressData = response.data.result.address_components
      const obj:any = {};
      addressData.forEach((aPart)=>{
        if (aPart.types.includes("street_number") ) obj.line1 = aPart.long_name
        if (aPart.types.includes("route") ) obj.line1 = obj.line1 +" "+aPart.long_name
        if (aPart.types.includes("locality") ) obj.city = aPart.long_name
        if (aPart.types.includes("administrative_area_level_1") ) obj.state = aPart.long_name
        if (aPart.types.includes("postal_code") ) obj.postal_code = aPart.long_name
      })
      const location = response.data.result.geometry.location;
      var point = { type: 'Point', coordinates: [location.lat,location.lng]}
      obj.geo = point
      return obj;
}

export const getDistance = async (pointA,pointB,mode = null)=>{
    const dMode = mode ?? "bicycling";
    const params = `mode=${dMode}&origin=${pointA}&destination=${pointB}&key=`+key
    var config = {
        method: 'get',
        url: 'https://maps.googleapis.com/maps/api/directions/json?'+params,
        headers: { }
      };
      
      const response = await axios(config)
      const results = response.data.routes[0].legs
      if(results){
            return({
                distance:results[0].distance,
                duration:results[0].duration,
            })
        } else {
            return false
        }

}
